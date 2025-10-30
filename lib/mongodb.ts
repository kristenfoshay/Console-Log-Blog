import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
let client: MongoClient;
let db: Db;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  const clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (!db) {
    let clientInstance: MongoClient;
    if (process.env.NODE_ENV === 'development') {
      clientInstance = await global._mongoClientPromise;
    } else {
      clientInstance = await client.connect();
    }
    db = clientInstance.db('blog_platform');
    
    await db.collection('posts').createIndex({ title: 'text', content: 'text' });
    await db.collection('posts').createIndex({ createdAt: -1 });
  }
  
  return { client: process.env.NODE_ENV === 'development' ? await global._mongoClientPromise : client, db };
}