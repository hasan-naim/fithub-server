const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
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
    const usersExercisesCollection = database.collection("usersExercises");

    /// endpoints
    app.get("/allExercises", async (req, res) => {
      try {
        const query = {};
        const result = await allExercisesCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        console.log(err);
      }
    });

    /// get exercises by a user

    app.get("/exercisesByUser", async (req, res) => {
      try {
        const userEmail = req.query.email;
        const query = { userEmail };

        const result = await usersExercisesCollection.findOne(query);

        if (result !== null) {
          res.send({ response: "success", result: result?.exercisesData });
        } else {
          res.send({ response: "null", result: [] });
        }
      } catch (err) {
        console.log(err);
      }
    });

    ///add exercises to for a user
    app.post("/addExercise", async (req, res) => {
      try {
        const userEmail = req.query.email;
        const exerciseData = req.body;

        const queryForFind = { userEmail: userEmail };

        const isUserExist = await usersExercisesCollection.findOne(
          queryForFind
        );

        if (isUserExist === null) {
          const insertData = {
            userEmail,
            exercisesData: [exerciseData],
            time: new Date(),
          };
          const result = await usersExercisesCollection.insertOne(insertData);

          res.send(result);
        } else {
          const prevData = await usersExercisesCollection.findOne(queryForFind);

          // console.log(prevData.exercisesData);
          const hasBefore = prevData.exercisesData.find(
            (el) => el._id === exerciseData._id
          );

          console.log(hasBefore);

          if (hasBefore) {
            res.send({
              result: "You have added this exercise before! Try Another One.",
            });
          } else {
            const updatedDoc = {
              $set: {
                exercisesData: [...prevData.exercisesData, exerciseData],
              },
            };

            const result = await usersExercisesCollection.updateOne(
              queryForFind,
              updatedDoc
            );

            res.send(result);
          }
        }
      } catch (err) {
        console.log(err);
      }
    });

    /// delete a exercise from user
    app.delete("/deleteExerciseByUser", async (req, res) => {
      try {
        const id = req.query.id;
        const userEmail = req.query.email;
        const userQuery = { userEmail };

        const userData = await usersExercisesCollection.findOne(userQuery);

        const newData = userData?.exercisesData.filter((el) => el._id !== id);

        const updatedDoc = {
          $set: {
            exercisesData: newData,
          },
        };

        const result = await usersExercisesCollection.updateOne(
          userQuery,
          updatedDoc
        );

        res.send({ result, response: "success" });
      } catch (err) {
        console.log(err);
      }
    });

    /// error
  } catch (err) {
    console.log(err);
  }
}

dbConnect().catch((err) => console.log(err));

app.listen(port, () => console.log(`server is running on port ${port}`));
