const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000



app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Hello Wanderlust world!')
})


const uri = process.env.MONGODB_URI;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db("wanderlust");
    const destinationsCollection = db.collection("destinations");


    // Destination related API endpoints


    app.get("/api/destinations", async (req, res) => {
      const { category } = req.query;
      const query = {};
      if (category) {
        query.category = category;
      }
      const destinations = await destinationsCollection.find(query).toArray();
      res.json(destinations);
    });

   
    app.get("/api/featured-destinations", async (req, res) => {
      const featuredDestinations = await destinationsCollection
        .find()
        .limit(6)
        .toArray();
      res.json(featuredDestinations);
    });


    app.get("/api/destinations/:id", async (req, res) => {
          const id = req.params.id;
          const destination = await destinationsCollection.findOne({
            _id: new ObjectId(id),
          });
          res.json(destination);
        });



    app.post("/api/destinations", async (req, res) => {
      const destination = req.body;
      console.log("req.body", req.body)
      const result = await destinationsCollection.insertOne(destination);
      res.json(result);
    });

    app.patch("/api/destinations/:id", async (req, res) => {
      const id = req.params.id;
      const destination = req.body;
      const result = await destinationsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: destination },
        { upsert: true },
      );
      const updated = await destinationsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.json({...result, updated});
    });


    app.delete("/api/destinations/:id", async (req, res) => {
      const id = req.params.id;
      const result = await destinationsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
