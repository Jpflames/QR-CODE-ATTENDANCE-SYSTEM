import { MongoClient } from "mongodb";

async function run() {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/dummy";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const users = await db.collection("user").find({}).toArray();
    console.log("Users:", JSON.stringify(users, null, 2));
    const accounts = await db.collection("account").find({}).toArray();
    console.log("Accounts:", JSON.stringify(accounts, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}
run();
