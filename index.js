const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

// Middleware


app.use(cors({ origin: ["https://psgroup.io", "http://localhost:5173"] }));
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
    const userCollection = client.db('RestuPOS').collection('usInfo');
    const addFoodCollection = client.db('RestuPOS').collection('addFood');
    const adddPurchesProducts = client.db('RestuPOS').collection('addPurches');
    const addOrderCollection = client.db('RestuPOS').collection('Order');
    const attenCollection = client.db('RestuPOS').collection('atten')

    // jwt related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      })
      res.send({ token });
    })
    
    

    //user related api
    app.post('/usInfo', async (req, res) => {
      const user = req.body;
      const queary = { email: user.email }
      const existingUser = await userCollection.findOne(queary);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })

      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })
     
    //middlewares
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'forbidden access' })
      }
      const token = req.headers.authorization.split(' ')[1]
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
      })
      

    }
    const verifyAdmin = async (req,res,next)=>{
      const email = req.decoded.email;
      const query = {email:email};
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role == 'admin';
      if(!isAdmin){
        return res.status(403).send({message:'forbiddden access'});
  
      }
      next();
      }
    //admin api 
    app.get ('/usInfo/admin/:email', verifyToken, async (req , res)=>{
      const email = req.params.email;
      if(email !== req.decoded.email){
        return res.status(403).send({message:'unauter'})
      }
    const queary = {email: email};
    const user = await userCollection.findOne(queary);
    let admin = false;
    if(user){
      admin = user?.role === 'admin';
    }
    res.send({admin});
    })

    //manager api
     app.get ('/usInfo/manager/:email', verifyToken,async (req , res)=>{
      const email = req.params.email;
      if(email !== req.decoded.email){
        return res.status(403).send({message:'unauter'})
      }
    const queary = {email: email};
    const user = await userCollection.findOne(queary);
    let manager = false;
    if(user){
      admin = user?.role === 'manager';
    }
    res.send({manager});
    })
    // salles man api
    app.get ('/usInfo/sellsMan/:email', verifyToken,async (req , res)=>{
      const email = req.params.email;
      if(email !== req.decoded.email){
        return res.status(403).send({message:'unauter'})
      }
    const queary = {email: email};
    const user = await userCollection.findOne(queary);
    let sellsMan = false;
    if(user){
      sellsMan = user?.role === 'sellsMan';
    }
    res.send({sellsMan});
    })

   
    //get all user on admin palen
    app.get('/usInfo', verifyToken,verifyAdmin, async (req, res) => {

      const result = await userCollection.find().toArray();
      res.send(result);
    })
    // get user for profile
    app.get('/usInfos', async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.status(400).send({ message: 'Email is requre' })
      }
      const result = await userCollection.find({ email }).toArray();
      res.send(result)
    })
  



    app.delete('/usInfo/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query)
      res.send(result)
    })

    //admin
    app.patch('/usInfo/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })
    app.patch('/usInfo/manager/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'manager'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })
    app.patch('/usInfo/sellsMan/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'sellsMan'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })


    // POST endpoint to add new food
    app.post('/addFood', async (req, res) => {
      const add = req.body;
      const result = await addFoodCollection.insertOne(add);
      res.send(result)
    })
    app.get('/addFood', async (req, res) => {
      const result = await addFoodCollection.find().toArray();
      res.send(result)
    })
   
// Update food item
app.patch('/addFood/:id', async (req, res) => {
  const { id } = req.params;
  const { foodName, foodPrice } = req.body;

  try {
    // Attempt to find and update the food item
    const updatedFood = await Food.findByIdAndUpdate(
      id,
      { foodName, foodPrice },
      { new: true }
    );

    if (!updatedFood) {
      return res.status(404).json({ message: "Food item not found" }); // Return 404 if not found
    }

    res.json(updatedFood); // Send back the updated food item
  } catch (error) {
    console.error("Error updating food item:", error);
    res.status(500).json({ message: "Failed to update food item" }); // Return a 500 error if the update fails
  }
});


// Delete food item
app.delete("/addFood/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await addFoodCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Food item not found" });
    }
    res.json({ message: "Food item deleted successfully", result });
  } catch (error) {
    res.status(500).json({ message: "Error deleting food item", error });
  }
});

    

    app.post('/addPurches', async (req, res) => {
      const add = req.body;
      const result = await adddPurchesProducts.insertOne(add);
      res.send(result)
    })

//get
    app.get('/addPurches', async (req, res) => {
      const result = await adddPurchesProducts.find().toArray();
      res.send(result)
    })

    //Order post

    app.post('/Order', async (req, res) => {
      const newOrder = req.body;
      const result = await addOrderCollection.insertOne(newOrder);
      res.send(result);

    })
    app.get('/allOrder', async (req, res) => {
      const result = await addOrderCollection.find().toArray();
      res.send(result)
    })
    //Order Get
    app.get('/Order', async (req, res) => {
      const userEmail = req.query.email;
      if (!userEmail) {
        return res.status(400).send({ message: 'Email is requre' })
      }
      const result = await addOrderCollection.find({ userEmail }).toArray();
      res.send(result)
    })

    app.get('/allOrders', async (req, res) => {
      const result = await addOrderCollection.find().toArray();
      res.send(result)
    })

    //attend api
    app.post('/atten', async (req, res) => {
      const newOrder = req.body;
      const result = await attenCollection.insertOne(newOrder);
      res.send(result);

    })
    app.get('/atten', async (req, res) => {
      const result = await attenCollection.find().toArray();
      res.send(result)
    })




    
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