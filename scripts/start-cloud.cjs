const { spawn } = require('node:child_process');
const path = require('node:path');

// Define a origem antes de carregar o Expo/Metro, que lê este valor ao iniciar.
const origin = new URL(process.env.ALLSET_API_URL || 'https://allset-tcc-allset-compose.vn6tpb.easypanel.host');
if (origin.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(origin.hostname)) {
  throw new Error('Use HTTPS para a API remota.');
}
const args = process.argv.slice(2);
const child = spawn(process.execPath, [require.resolve('expo/bin/cli'), 'start', '--port', '8090', ...args], {
  cwd: path.resolve(__dirname, '..'),
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
child.on('exit', (code) => { process.exitCode = code ?? 1; });
process.on('SIGINT', () => child.kill('SIGINT'));
process.on('SIGTERM', () => child.kill('SIGTERM'));
