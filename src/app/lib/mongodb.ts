import { MongoClient, Db } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'streaming_data';
const batchDbName = 'disasterDB';
const options = {};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

const getClient = () => {
  if (!client) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  return clientPromise!;
};

export const getDb = async (): Promise<Db> => {
  const client = await getClient();
  return client.db(dbName);
};
export const getBatchDb = async (): Promise<Db> => {
  const client = await getClient();
  return client.db(batchDbName);
};
export default getClient;