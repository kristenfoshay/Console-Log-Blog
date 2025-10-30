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
  client = global._mongoClientPromise as any;
} else {
  client = new MongoClient(uri);
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (!db) {
    const clientInstance = await client.connect();
    db = clientInstance.db('blog_platform');
    
    await db.collection('posts').createIndex({ title: 'text', content: 'text' });
    await db.collection('posts').createIndex({ createdAt: -1 });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  }
  
  return { client, db };
}