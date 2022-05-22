require("dotenv").config();
const port = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
//middleware
app.use(cors());
app.use(express.json());

//MongoDB

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hy2si.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const toolsCollection = client.db("manufacture").collection("tools");
    //post tool in database
    app.post("/tools", async (req, res) => {
      const newTool = req.body;
      console.log(newTool);
      const result = await toolsCollection.insertOne(newTool);
      res.send(result);
    });
    //Get tools from database
    app.get("/tools", async (req, res) => {
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = toolsCollection.find(query);
      let tools;
      if (size) {
        tools = await cursor.limit(size).toArray();
      } else {
        tools = await cursor.toArray();
      }
      res.send(tools);
    });
  } finally {
  }
}
run().catch(console.dir);

//Test purpose api
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(port, () => {
  console.log(`Listening from port ${port}`);
});
