const express = require("express");
require("dotenv").config();

const app = express();

const port = 5000 || process.env.PORT;

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => console.log(`server is running on port ${port}`));
