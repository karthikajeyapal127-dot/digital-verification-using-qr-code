import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isConnected = false;
let mongoServer = null;
let activeURI = '';

export const connectDB = async () => {
  const defaultURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/veriglass';

  // 1. First attempt: connect to existing local or remote MongoDB service
  try {
    const conn = await mongoose.connect(defaultURI, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    activeURI = defaultURI;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} (${conn.connection.name})`);
    return true;
  } catch (err) {
    console.log(`[MongoDB] Local daemon not detected on ${defaultURI}. Starting embedded MongoDB instance...`);
  }

  // 2. Embedded instance fallback using MongoMemoryServer
  try {
    const dataDir = path.join(__dirname, '../data/mongodb');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    } else {
      try {
        const lock1 = path.join(dataDir, 'mongod.lock');
        if (fs.existsSync(lock1)) fs.unlinkSync(lock1);
        const lock2 = path.join(dataDir, 'WiredTiger.lock');
        if (fs.existsSync(lock2)) fs.unlinkSync(lock2);
      } catch (lockErr) {
        // non-fatal if locked by active instance
      }
    }

    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '8.2.6'
      },
      instance: {
        dbPath: dataDir,
        storageEngine: 'wiredTiger'
      }
    });

    activeURI = mongoServer.getUri();
    const conn = await mongoose.connect(activeURI);
    isConnected = true;
    console.log(`[MongoDB] Embedded MongoDB 8.2.6 running and connected: ${activeURI}`);
    console.log(`[MongoDB] Persistent storage path: ${dataDir}`);
    return true;
  } catch (memErr) {
    // In case wiredTiger folder lock occurs, start in-memory instance
    try {
      mongoServer = await MongoMemoryServer.create({
        binary: {
          version: '8.2.6'
        }
      });
      activeURI = mongoServer.getUri();
      await mongoose.connect(activeURI);
      isConnected = true;
      console.log(`[MongoDB] In-memory MongoDB 8.2.6 running and connected: ${activeURI}`);
      return true;
    } catch (fallbackErr) {
      console.error('[MongoDB Error] Failed to connect to any MongoDB instance:', fallbackErr.message);
      isConnected = false;
      return false;
    }
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host || '127.0.0.1',
  name: mongoose.connection.name || 'veriglass',
  type: mongoServer ? 'Embedded MongoDB Engine (Mongoose)' : 'External MongoDB Service'
});

export const closeDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};
