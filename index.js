require("dotenv").config();
const port = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
//middleware
app.use(cors());
app.use(express.json());


//Test purpose api
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`Listening from port ${port}`);
});