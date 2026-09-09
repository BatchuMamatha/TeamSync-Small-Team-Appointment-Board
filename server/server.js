const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Appointment Board server running at:`);
  console.log(`-> http://localhost:${PORT}`);
  console.log(`====================================================`);
});
