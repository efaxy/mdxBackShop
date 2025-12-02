const { MongoClient } = require("mongodb");
const express = require("express");
require("dotenv").config();

const app = express();

const client = new MongoClient(process.env.MONGODB_URL);

const start = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log(err);
    }
};

start();
