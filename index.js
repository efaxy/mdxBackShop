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

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.listen(3000);
