const app = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  NEWS24 NETWORK - BROADCAST API SERVER      `);
  console.log(`  Live on port: http://localhost:${PORT}              `);
  console.log(`  Health Check: http://localhost:${PORT}/api/health    `);
  console.log(`=======================================================`);
});
