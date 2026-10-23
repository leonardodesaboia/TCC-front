const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { isSyncedPath, runtimeDirectory, syncSources, safeTarget, needsInstall, lockHash, LOCK_MARKER } = require('./cloud-runtime.cjs');

test('detecta OneDrive pessoal/corporativo e raiz configurada sem confundir pasta irmã', () => {
  assert.equal(isSyncedPath('C:\\Users\\test\\OneDrive\\front', {}), true);
  assert.equal(isSyncedPath('C:\\Users\\test\\OneDrive - Equipe\\front', {}), true);
  assert.equal(isSyncedPath(path.join(os.tmpdir(), 'sync', 'front'), { OneDrive: path.join(os.tmpdir(), 'sync') }), true);
  assert.equal(isSyncedPath(path.join(os.tmpdir(), 'sync-other'), { OneDrive: path.join(os.tmpdir(), 'sync') }), false);
});

test('sincroniza fontes novos/alterados/excluídos sem copiar segredos ou dependências', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'allset-launcher-'));
  const src = path.join(root, 'source'); const dst = path.join(root, 'runtime');
  fs.mkdirSync(src); execFileSync('git', ['init', '--quiet', src]);
  fs.writeFileSync(path.join(src, 'package.json'), '{}');
  fs.writeFileSync(path.join(src, '.env'), 'SENTINEL_TEST_ONLY=private');
  fs.writeFileSync(path.join(src, '.env.local'), 'SENTINEL_TEST_ONLY=private');
  fs.writeFileSync(path.join(src, '.env.example'), 'PUBLIC_EXAMPLE=true');
  fs.mkdirSync(path.join(src, 'node_modules')); fs.writeFileSync(path.join(src, 'node_modules', 'bad.js'), 'throw Error()');
  execFileSync('git', ['-C', src, 'add', '.']);
  fs.writeFileSync(path.join(src, 'new-module.js'), 'v1');
  syncSources(src, dst);
  assert.equal(fs.existsSync(path.join(dst, '.env')), false);
  assert.equal(fs.existsSync(path.join(dst, '.env.local')), false);
  assert.equal(fs.existsSync(path.join(dst, 'node_modules')), false);
  assert.equal(fs.existsSync(path.join(dst, '.env.example')), true);
  fs.writeFileSync(path.join(src, 'new-module.js'), 'v2');
  syncSources(src, dst); assert.equal(fs.readFileSync(path.join(dst, 'new-module.js'), 'utf8'), 'v2');
  fs.writeFileSync(path.join(dst, 'runtime-only.txt'), 'preserve');
  fs.unlinkSync(path.join(src, 'new-module.js')); syncSources(src, dst);
  assert.equal(fs.existsSync(path.join(dst, 'new-module.js')), false);
  assert.equal(fs.readFileSync(path.join(dst, 'runtime-only.txt'), 'utf8'), 'preserve');
});

test('reinstala quando o lock muda ou o Expo local desaparece', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'allset-lock-'));
  fs.writeFileSync(path.join(dir, 'package-lock.json'), '{}');
  assert.equal(needsInstall(dir), true);
  fs.mkdirSync(path.join(dir, 'node_modules', 'expo', 'bin'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'node_modules', 'expo', 'bin', 'cli'), '');
  fs.writeFileSync(path.join(dir, LOCK_MARKER), lockHash(dir));
  assert.equal(needsInstall(dir), false);
  fs.writeFileSync(path.join(dir, 'package-lock.json'), '{"changed":true}');
  assert.equal(needsInstall(dir), true);
});

test('recusa caminhos que saiam da cópia de execução', () => {
  assert.throws(() => safeTarget(os.tmpdir(), path.join('..', 'outside.txt')), /Caminho inválido/);
});

test('usa diretório estável fora do OneDrive, com isolamento por checkout', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'allset-path-'));
  const first = path.join(root, 'front-a'); const second = path.join(root, 'front-b');
  fs.mkdirSync(first); fs.mkdirSync(second);
  assert.equal(runtimeDirectory(first, root), runtimeDirectory(first, root));
  assert.notEqual(runtimeDirectory(first, root), runtimeDirectory(second, root));
  assert.equal(runtimeDirectory(first, root).startsWith(path.join(root, '.allset', 'expo') + path.sep), true);
  assert.throws(() => runtimeDirectory(first, path.join(root, 'OneDrive')), /também está no OneDrive/);
});

test('sincronização periódica evita regravar arquivos inalterados e propaga edições', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'allset-sync-'));
  const src = path.join(root, 'source'); const dst = path.join(root, 'runtime');
  fs.mkdirSync(src); execFileSync('git', ['init', '--quiet', src]);
  fs.writeFileSync(path.join(src, 'screen.tsx'), 'initial');
  const signatures = syncSources(src, dst);
  const target = path.join(dst, 'screen.tsx');
  const oldDate = new Date('2000-01-01T00:00:00Z');
  fs.utimesSync(target, oldDate, oldDate);
  syncSources(src, dst, signatures);
  assert.equal(fs.statSync(target).mtimeMs, oldDate.getTime());
  fs.writeFileSync(path.join(src, 'screen.tsx'), 'updated content');
  syncSources(src, dst, signatures);
  assert.equal(fs.readFileSync(target, 'utf8'), 'updated content');
});
