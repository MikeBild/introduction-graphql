const start = require('./lib/server');
const port = process.env.PORT || 8080;
const signal = process.env.SIGNAL || 'SIGINT';
const isProd = process.env.NODE_ENV === 'production';

main({ port, isProd });

async function main({ port, isProd }) {
  const { stop, url } = await start({ port, isProd });

  console.log(`Listen on ${url}`);
  console.log(`Production: ${isProd}`);
  console.log(`Stop-Signal: ${signal}`);

  process.once(signal, async () => {
    console.log('Shutdown initiated');
    await stop();
    console.log('Shutdown');
    process.exit(0);
  });
}
