import { MongoClient } from "mongodb";

// Cache the MongoClient across hot-reloads in development
declare global {
	// eslint-disable-next-line no-var
	var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI as string | undefined;
if (!uri) {
	throw new Error("MONGODB_URI is not set in environment variables");
}

const clientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
	if (!global._mongoClientPromise) {
		client = new MongoClient(uri, clientOptions);
		global._mongoClientPromise = client.connect();
	}
	clientPromise = global._mongoClientPromise as Promise<MongoClient>;
} else {
	client = new MongoClient(uri, clientOptions);
	clientPromise = client.connect();
}

export async function getMongoClient(): Promise<MongoClient> {
	return clientPromise;
}

export async function getDb(dbName?: string) {
	const client = await getMongoClient();
	const name = dbName || process.env.MONGODB_DB_NAME || "Inventry-1credit";
	return client.db(name);
}


