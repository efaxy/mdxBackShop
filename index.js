const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const app = express();
app.use(express.json());

app.use("/img", express.static(path.join(__dirname, "img")));

if (!process.env.MONGODB_URL) {
    console.error("MONGODB_URL is not defined in environment variables");
    process.exit(1);
}

const url = process.env.MONGODB_URL;
let db;

MongoClient.connect(url)
    .then((client) => {
        db = client.db("activities");
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
    });

// Enable CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
    );

    next();
});

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware to handle :collectionName parameter
app.param("collectionName", (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

// Routes

// Search route
app.get("/collection/:collectionName/search", async (req, res) => {
    try {
        const queryStr = req.query.q;
        if (!queryStr) return res.status(400).json({ msg: "Query required" });

        const results = await req.collection
            .find({
                $or: [
                    { title: { $regex: queryStr, $options: "i" } },
                    { location: { $regex: queryStr, $options: "i" } },
                ],
            })
            .toArray();

        res.json(results);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// Get all documents in a collection
app.get("/collection/:collectionName", async (req, res) => {
    const results = await req.collection.find({}).toArray();
    res.json(results);
});

// Create an order
app.post("/collection/:collectionName", async (req, res) => {
    const result = await req.collection.insertOne(req.body);
    res.json(result);
});

// Update a document
app.put("/collection/:collectionName/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).send("Invalid ID");
        }

        const result = await req.collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: req.body }
        );

        res.json(result);
    } catch (e) {
        res.status(500).send("Error updating document");
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
