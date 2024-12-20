const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;

// Middleware


app.use(cors({origin:["https://restupos-2.web.app","http://localhost:5173"]}));
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
    const addOrderCollection = client.db('RestuPOS').collection('Order');
    const attenCollection = client.db('RestuPOS').collection('atten')

// jwt related api
app.post('/jwt',async(req,res) =>{
  const user = req.body;
  const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
    expiresIn:'1h' })
    res.send({token});
})

    //user related api
    app.post('/usInfo', async (req,res)=>{
      const user  = req.body;
      const queary = {email: user.email}
      const existingUser = await userCollection.findOne(queary);
      if(existingUser){
        return res.send ({message: 'user already exists', insertedId: null})
        
      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })
    //middlewares
    const verifyToken = (req, res, next) =>{
      console.log('inside verify token', req.headers);
      if(!req.headers.authorization){
        return res.status(401).send({message: 'forbidden access'})
      }
      const token = req.headers.authorization.split(' ')[1]
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
        if(err){
          return res.status(401).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
      })
      
    }
    // get user for profile
    app.get('/profile', async(req,res)=>{
      const email = req.query.email;
      if(!email){
        return res.status(400).send({message: 'Email is requre'})
      }
      const result = await userCollection.find({email}).toArray();
      res.send(result)
    })
    //get all user on admin palen
    app.get('/usInfo',verifyToken, async(req,res)=> {
      
      const result = await userCollection.find().toArray();
      res.send(result);
    })
    app.delete('/usInfo/:id', async(req,res)=> {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)  }
      const result = await userCollection.deleteOne(query)
      res.send(result)
    })

    //admin
    app.patch('/usInfo/admin/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id:new ObjectId(id)};
      const updatedDoc = {
        $set:{
          role:'admin'
        }
      }
      const result = await userCollection.updateOne(filter,updatedDoc)
      res.send(result);
    })
    app.patch('/usInfo/manager/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id:new ObjectId(id)};
      const updatedDoc = {
        $set:{
          role:'manager'
        }
      }
      const result = await userCollection.updateOne(filter,updatedDoc)
      res.send(result);
    })
    app.patch('/usInfo/sellsMan/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id:new ObjectId(id)};
      const updatedDoc = {
        $set:{
          role:'sellsMan'
        }
      }
      const result = await userCollection.updateOne(filter,updatedDoc)
      res.send(result);
    })


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
   app.get('/allOrder', async(req,res)=>{
    const result = await addOrderCollection.find().toArray();
    res.send(result)
  })
   //Order Get
   app.get('/Order', async(req,res)=>{
    const userEmail = req.query.email;
    if(!userEmail){
      return res.status(400).send({message: 'Email is requre'})
    }
    const result = await addOrderCollection.find({userEmail}).toArray();
    res.send(result)
  })

  //attend api
  app.post('/atten', async (req, res ) =>{
    const newOrder = req.body;
    const result = await attenCollection.insertOne(newOrder);
    res.send(result);

 })
 app.get('/atten', async(req,res)=>{
  const result = await attenCollection.find().toArray();
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