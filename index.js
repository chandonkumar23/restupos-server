const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware


app.use(cors({origin:["https://restupos-2.web.app","http://localhost:5174"]}));
app.use(express.json());

// MongoDB connection string and client configuration
const uri =
  'mongodb+srv://RestuPOS:aaGDbua0OXgIoO4S@cluster0.6tweslj.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    // await client.connect();

    // Define the database and collection
    const addFoodCollection = client.db('RestuPOS').collection('addFood');
    const addOrderCollection = client.db('RestuPOS').collection('Order');



    

    // POST endpoint to add new food
    app.post('/addFood', async(req,res)=>{
      const add = req.body;
      const result = await addFoodCollection.insertOne(add);
      res.send(result)
    })

    
    app.get('/addFood', async(req,res)=>{
      const result = await addFoodCollection.find().toArray();
      res.send(result)
    })
  
        //Order post
    
     app.post('/Order', async (req, res ) =>{
      const newOrder = req.body;
      const result = await addOrderCollection.insertOne(newOrder);
      res.send(result);

   })

   //Order Get
   app.get('/Order', async(req,res) =>{
     const coursor = addOrderCollection.find();
     const result = await coursor.toArray();
     res.send(result)
   }) 

     

    // Confirm connection with a ping
    // await client.db('admin').command({ ping: 1 });
    // console.log('Pinged your deployment. Successfully connected to MongoDB!');
  }
   catch (error) {
    console.error('Error in MongoDB connection:', error);
  }
  
}

// Start the server and run the MongoDB connection
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('RestuPOS server is running');
});

app.listen(port, () => {
  console.log(`RestuPOS server is running on port: ${port}`);
});  