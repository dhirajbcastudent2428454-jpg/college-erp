import mongoose from 'mongoose';
import { env } from './env.js';

let connected = false;

export async function connectDatabase() {
  if (!env.MONGODB_URI) {
    if (env.NODE_ENV === 'production') throw new Error('MONGODB_URI is required');
    return { connected: false, mode: 'development-memory-fallback' };
  }
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
      maxPoolSize: 10,
      autoIndex: env.NODE_ENV !== 'production'
    });
    connected = true;
    return { connected: true, mode: 'mongodb' };
  } catch (error) {
    if (env.NODE_ENV === 'production') throw error;
    console.warn('MongoDB unavailable; development uses an explicit in-memory demo adapter.', error.message);
    return { connected: false, mode: 'development-memory-fallback', error: error.message };
  }
}

export function isDatabaseReady() {
  return connected || !env.MONGODB_URI && env.NODE_ENV !== 'production';
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  connected = false;
}
