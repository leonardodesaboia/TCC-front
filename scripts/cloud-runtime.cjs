const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const MANIFEST = '.allset-source-files.json';
const LOCK_MARKER = '.allset-installed-lock.sha256';

function isSyncedPath(directory, env = process.env) {
  const resolved = path.resolve(directory).toLowerCase();
  const roots = [env.OneDrive, env.OneDriveConsumer, env.OneDriveCommercial].filter(Boolean);
  return roots.some((root) => {
    const candidate = path.resolve(root).toLowerCase();
    return resolved === candidate || resolved.startsWith(candidate + path.sep);
  }) || /(^|[\\/])onedrive(?: - [^\\/]+)?([\\/]|$)/i.test(directory);
}

function runtimeDirectory(source, home = os.homedir()) {
  const canonical = fs.realpathSync(source);
  const key = crypto.createHash('sha256').update(process.platform === 'win32' ? canonical.toLowerCase() : canonical).digest('hex').slice(0, 12);
  // AppData pode ser virtualizado pelo aplicativo que abre o terminal no Windows.
  // A pasta do usuário fornece um caminho estável também para Metro e Vitest.
  const result = path.resolve(home, '.allset', 'expo', key);
  if (isSyncedPath(result)) throw new Error('A pasta local de execução também está no OneDrive. Use um checkout fora da pasta sincronizada.');
  return result;
}

function safeTarget(root, relative) {
  const result = path.resolve(root, relative);
  const inside = path.relative(path.resolve(root), result);
  if (!inside || inside === '..' || inside.startsWith('..' + path.sep) || path.isAbsolute(inside)) {
    throw new Error('Caminho inválido na cópia de execução.');
  }
  return result;
}

function includeFile(relative) {
  const segments = relative.replace(/\\/g, '/').split('/');
  return !segments.some((segment) => ['node_modules', '.git', '.expo', 'dist', 'web-build'].includes(segment)
    || (segment.startsWith('.env') && segment !== '.env.example') || segment === '.npmrc');
}

function syncSources(source, destination, signatures = new Map()) {
  // Git lista os fontes, sem percorrer os milhares de arquivos do node_modules sincronizado.
  const listing = spawnSync('git', ['-C', source, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' });
  if (listing.status !== 0) throw new Error('Não foi possível listar os fontes com Git. Instale o Git e use um clone do repositório.');
  fs.mkdirSync(destination, { recursive: true });
  const manifest = path.join(destination, MANIFEST);
  const previous = fs.existsSync(manifest) ? JSON.parse(fs.readFileSync(manifest, 'utf8')) : [];
  const current = [];
  for (const relative of new Set(listing.stdout.split('\0').filter(Boolean))) {
    if (!includeFile(relative)) continue;
    const from = safeTarget(source, relative);
    if (!fs.existsSync(from)) continue;
    const stat = fs.lstatSync(from);
    if (!stat.isFile()) continue;
    const to = safeTarget(destination, relative);
    const signature = `${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`;
    if (signatures.get(relative) !== signature || !fs.existsSync(to)) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      try {
        fs.copyFileSync(from, to);
      } catch (error) {
        throw new Error(`Não foi possível ler ${relative}. No OneDrive, marque a pasta do projeto como "Sempre manter neste dispositivo" e tente novamente. (${error.code || 'erro de leitura'})`);
      }
      signatures.set(relative, signature);
    }
    current.push(relative);
  }
  // Remove apenas fontes previamente copiados que deixaram de existir no checkout.
  const present = new Set(current);
  for (const relative of previous) {
    if (present.has(relative)) continue;
    const obsolete = safeTarget(destination, relative);
    if (fs.existsSync(obsolete) && fs.lstatSync(obsolete).isFile()) fs.unlinkSync(obsolete);
    signatures.delete(relative);
  }
  if (JSON.stringify(previous) !== JSON.stringify(current)) fs.writeFileSync(manifest, JSON.stringify(current));
  return signatures;
}

function lockHash(directory) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, 'package-lock.json'))).digest('hex');
}

function needsInstall(directory) {
  const marker = path.join(directory, LOCK_MARKER);
  return !fs.existsSync(path.join(directory, 'node_modules', 'expo', 'bin', 'cli'))
    || !fs.existsSync(marker) || fs.readFileSync(marker, 'utf8').trim() !== lockHash(directory);
}

function ensureDependencies(directory) {
  if (!needsInstall(directory)) return;
  console.log('AllSet: instalando dependências locais com npm ci (primeira execução ou lockfile alterado).');
  const command = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm';
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', 'npm.cmd ci --no-audit --no-fund'] : ['ci', '--no-audit', '--no-fund'];
  const install = spawnSync(command, args, { cwd: directory, stdio: 'inherit', windowsHide: true });
  if (install.error || install.status !== 0) throw new Error('npm ci falhou na pasta local de execução. Confira a saída acima.');
  fs.writeFileSync(path.join(directory, LOCK_MARKER), lockHash(directory));
}

module.exports = { isSyncedPath, runtimeDirectory, syncSources, needsInstall, ensureDependencies, includeFile, safeTarget, lockHash, LOCK_MARKER };
