const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');

let isConnected = false;
let useMock = true;

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('========================================');
    console.error('[FATAL] MONGODB_URI is not set in .env!');
    console.error('The server REFUSES to start without a valid Atlas connection.');
    console.error('This prevents the silent-fallback bug where OTPs get saved');
    console.error('to local JSON files instead of Atlas.');
    console.error('========================================');
    process.exit(1);
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[BOOT] PID: ${process.pid} | Connecting to MongoDB Atlas (attempt ${attempt}/${maxRetries})...`);
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 20000
      });
      isConnected = true;
      useMock = false;
      console.log(`[BOOT] PID: ${process.pid} | DB Mode: ATLAS — MongoDB Atlas Connected Successfully.`);
      return;
    } catch (err) {
      console.error(`[BOOT] Atlas connection attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) {
        console.error('========================================');
        console.error(`[FATAL] PID: ${process.pid} | MongoDB Atlas connection FAILED: ${err.message}`);
        console.error('The server REFUSES to start in local-fallback mode.');
        console.error('Fix your MONGODB_URI or network, then restart.');
        console.error('========================================');
        process.exit(1);
      }
      // Wait 2s before retry
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

module.exports = {
  connectDB,
  isConnected: () => isConnected,
  isMock: () => useMock
};
