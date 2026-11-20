require('../src/index.js');

setTimeout(async () => {
  try {
    require('./test-all-workflows.js');
  } catch (e) {
    console.error('Test runner failed:', e);
    process.exit(1);
  }
}, 1200);
