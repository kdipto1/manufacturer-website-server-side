require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
//middleware
app.use(cors());
app.use(express.json());

//Verify token function:
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

//MongoDB
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
    const orderCollection = client.db("manufacture").collection("orders");
    const reviewCollection = client.db("manufacture").collection("reviews");
    const userCollection = client.db("manufacture").collection("users");
    //Api for jwt token
    app.post("/login", async (req, res) => {
      const email = req.body;
      const token = await jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
      res.send({ token: token });
    });
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
    // Update single tool for update
    app.put("/tools/:id", async (req, res) => {
      const { id } = req.params;
      const data = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = { $set: data };
      const option = { upsert: true };
      const result = await toolsCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });
    //Get single tool from database
    app.get("/tools/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await toolsCollection.findOne(query);
      res.send(result);
    });
    //Delete single tool from database
    app.delete("/tools/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await toolsCollection.deleteOne(query);
      res.send(result);
    });
    // Get user order from client side and post in database
    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      console.log(newOrder);
      const result = await orderCollection.insertOne(newOrder);
      res.send(result);
    });
    // Get orders collection from database
    app.get("/orders", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };
      const cursor = orderCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
      console.log(result);
    });
    // post api for user review
    app.post("/review", async (req, res) => {
      const newReview = req.body;
      console.log(newReview);
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });
    // Get api for getting reviews of users
    app.get("/review", async (req, res) => {
      const query = {};
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });
    // Post user info in api
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });
    // Get user info from database
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const result = await userCollection.find(query).toArray();
      res.send(result);
    })
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
