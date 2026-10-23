const { spawn } = require('node:child_process');
const path = require('node:path');
const { isSyncedPath, runtimeDirectory, syncSources, ensureDependencies, needsInstall } = require('./cloud-runtime.cjs');

// Define a origem antes de carregar o Expo/Metro, que lê este valor ao iniciar.
const origin = new URL(process.env.ALLSET_API_URL || 'https://allset-tcc-allset-compose.vn6tpb.easypanel.host');
if (origin.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(origin.hostname)) {
  throw new Error('Use HTTPS para a API remota.');
}
const args = process.argv.slice(2);
const source = path.resolve(__dirname, '..');
let directory = source;
let commandArgs;
let signatures;
try {
  if (isSyncedPath(source)) {
    directory = runtimeDirectory(source);
    console.log(`AllSet: execução local fora do OneDrive em ${directory}`);
    console.log('AllSet: edite e use Git na pasta original; alterações nos fontes serão sincronizadas automaticamente.');
    signatures = syncSources(source, directory);
    ensureDependencies(directory);
    commandArgs = [path.join(directory, 'scripts', 'start-cloud.cjs'), ...args];
  } else {
    commandArgs = [require.resolve('expo/bin/cli'), 'start', '--port', '8090', ...args];
  }
} catch (error) {
  console.error(`AllSet: ${error.message}`);
  process.exit(1);
}
const child = spawn(process.execPath, commandArgs, {
  cwd: directory,
  windowsHide: true,
  stdio: 'inherit',
  env: {
    ...process.env,
    EXPO_PUBLIC_API_URL: origin.origin,
    EXPO_PUBLIC_WEB_USE_PROXY: 'true',
    EXPO_PUBLIC_USE_MOCKS: 'false',
    EXPO_PUBLIC_SKIP_AUTH: 'false',
  },
});
console.log(`AllSet: API ${origin.origin}; web com proxy de desenvolvimento; autenticação real.`);
child.on('error', (error) => { console.error(error); process.exitCode = 1; });
// Consulta somente a lista de fontes do Git, sem observar node_modules no OneDrive.
let lastWarning;
const syncTimer = directory !== source ? setInterval(() => {
  try {
    syncSources(source, directory, signatures);
    const warning = needsInstall(directory) ? 'Dependências alteradas. Reinicie este comando para executar npm ci antes de continuar.' : undefined;
    if (warning && warning !== lastWarning) console.error(`AllSet: ${warning}`);
    lastWarning = warning;
  } catch (error) {
    if (lastWarning !== error.message) console.error(`AllSet: ${error.message}`);
    lastWarning = error.message;
  }
}, 2000) : undefined;
child.on('exit', (code) => { clearInterval(syncTimer); process.exitCode = code ?? 1; });
child.on('error', () => clearInterval(syncTimer));
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
