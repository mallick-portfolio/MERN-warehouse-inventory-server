const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId, ObjectID } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

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
    

    // Get product from database
    app.get('/products', async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const result =  await cursor.toArray();
      res.send(result)
    })

    app.get('/inventory/:id', async (req, res) => {
      const {id} = req.params;
      const query = { _id: ObjectId(id)};
      const requlst = await productCollection.findOne(query)
      res.send(requlst)
    })

    // update product quantity 
    app.put('/inventory/:id', async (req, res) => {
      const data = req.body;
      const { id } = req.params;
      console.log(id)
      console.log(data)
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
          sold: data.sold
        },
      };
      const result = await productCollection.updateOne(filter, updateDoc, options);
      res.send(result)
    });










  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.get("/", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
