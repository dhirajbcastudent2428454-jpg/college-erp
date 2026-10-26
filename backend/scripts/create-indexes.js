import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { User } from '../src/models/User.js';
import { OTPChallenge } from '../src/models/OTPChallenge.js';
import { Session } from '../src/models/Session.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { Student } from '../src/models/Student.js';

const db = await connectDatabase();
if (!db.connected) { console.log('MongoDB is not connected; index initialization skipped in development fallback.'); process.exit(0); }
await Promise.all([User.createIndexes(), OTPChallenge.createIndexes(), Session.createIndexes(), AuditLog.createIndexes(), Student.createIndexes()]);
console.log('Authentication foundation indexes are ready.');
await disconnectDatabase();
