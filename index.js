const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
/// middleware for getting data from client side
app.use(express.json());
app.use(cors());

const port = 5000 || process.env.PORT;

app.get("/", (req, res) => {
  res.send("Server is running");
});

/// mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.49zsx7x.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function dbConnect() {
  try {
    /// databases and collections
    const database = client.db("fithubProject");
    const allExercisesCollection = database.collection("allExercises");

    /// endpoints
    app.get("/allExercises", async (req, res) => {
      const query = {};
      const result = await allExercisesCollection.find(query).toArray();
      res.send(result);
    });
  } catch (err) {}
}

dbConnect().catch((err) => console.log(err));

app.listen(port, () => console.log(`server is running on port ${port}`));
