const { MongoClient } = require("mongodb");
const express = require("express");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const app = express();
app.use(express.json());

const url = process.env.MONGODB_URL;

//db connection
let db;
MongoClient.connect(url, (error, client) => {
    if (error) {
        console.error("Failed to connect to MongoDB:", error);
        return;
    }

    db = client.db("activities");
    console.log("connected");
});

// app.use("/image", (req, res) => {	});

app.listen(3000);
