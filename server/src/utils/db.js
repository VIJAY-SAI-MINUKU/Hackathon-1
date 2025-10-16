const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase(mongoUri) {
  if (isConnected) return;
  if (!mongoUri) throw new Error('MONGO_URI is not set');
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  isConnected = true;
  mongoose.connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err);
  });
}

async function disconnectFromDatabase() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = { connectToDatabase, disconnectFromDatabase };
