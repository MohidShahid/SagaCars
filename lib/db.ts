import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("Please define mongodb uri in env");
}

// added mongoose connection state within global object
declare global {
  var mongoose:
    | {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      }
    | undefined;
}

// get cach connection from global
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  try {
    if (cached!.conn) return cached!.conn;

    if (!cached!.promise) {
      cached!.promise = mongoose.connect(MONGODB_URI).then((m) => m.connection);
    }
    cached!.conn = await cached!.promise;
    return cached!.conn;
  } catch (error) {
    console.error((error as Error).message);
  }
}
