const express = require('express')
const cors = require('cors');
require('dotenv').config()
const ObjectId = require("mongodb").ObjectId;
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// middlewareWrapper
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ssyph.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect()
        const notesCollection = client.db("notes-app").collection("notes")
        app.post("/notes", async (req, res) => {
            const user = req.body;
            const doc = {
                title: user.title,
                message: user.message,
                color: user.color,
                email: user.email,
            }
            const result = await notesCollection.insertOne(doc)
            res.send(result)
        })

        app.get("/notes", async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = notesCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get("/notes/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await notesCollection.findOne(query)
            res.send(result)
        })

        app.put('/notes/:id', async (req, res) => {
            const id = req.params.id;
            const doc = req.body;
            const query = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    title: doc.title,
                    message: doc.message,
                    color: doc.color,
                }
            }
            const result = await notesCollection.updateOne(query, updatedDoc, options)
            res.send(result)
        })
        app.delete("/notes/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await notesCollection.deleteOne(query)
            res.send(result)
        })
    }
    finally { }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send("Note app")
})
app.listen(port, () => {
    console.log("note server on", port)
})
