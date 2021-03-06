const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorization access" });
  }
  const token = authHeader.split(" ");
  jwt.verify(token[1], process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "forbiden" });
    }
    req.decoded = decoded;
  });

  next();
};

// dbName: dbinventor
//dbPassword: IcTeYLos5U4Z23bz

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASSWORD}@cluster0.0jsmu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const productCollection = client.db("inventory").collection("product");

    // auth
    app.post("/login", function (req, res) {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      
      res.send(token);
    });

    // insert product

    app.post("/product", async (req, res) => {
      const data = req.body;
      const product = {
        description: data.description,
        email: data.email,
        image: data.image,
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        sold: data.sold,
        supplier: data.supplier,
      };
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    // Get product from database
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // Get product from database
    app.get("/userProduct", verifyJWT, async (req, res) => {
      const user = req.query;
      const decodedEmail = req?.decoded?.email;
     console.log(decodedEmail)
      if (user.email == decodedEmail) {
        const query = { email: user.email };
        const cursor = productCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } else {
        res.status(403).send({ message: "forbiden" });
      }
    });

    // Find product by id 
    app.get("/inventory/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const requlst = await productCollection.findOne(query);
      res.send(requlst);
    });

    // update product quantity
    app.put("/inventory/:id", async (req, res) => {
      const data = req.body;
      const { id } = req.params;
      
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: data.name,
          email: data.email,
          quantity: data.quantity,
          price: data.price,
          image: data.image,
          description: data.description,
          supplier: data.supplier,
          sold: data.sold,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.delete("/product/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
