const app = require('./app');
const config = require('./config');

app.listen(config.port, (err) => {
  if (err) {
    console.error('Server failed to start:', err.message);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${config.port}`);
});
