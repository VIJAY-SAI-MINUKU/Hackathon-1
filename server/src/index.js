const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const { connectToDatabase } = require('./utils/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectToDatabase(process.env.MONGO_URI);
    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port ${PORT}`);
    });

    const shutdown = () => {
      server.close(() => {
        // eslint-disable-next-line no-console
        console.log('Server closed');
        process.exit(0);
      });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
