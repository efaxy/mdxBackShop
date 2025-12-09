const { MongoClient, ObjectId } = require('mongodb')
const express = require('express')
const fs = require('fs')
const path = require('path')

require('dotenv').config()

const app = express()
app.use(express.json())

app.use('/img', express.static(path.join(__dirname, 'img')))

if (!process.env.MONGODB_URL) {
	console.error('MONGODB_URL is not defined in environment variables')
	process.exit(1)
}

const url = process.env.MONGODB_URL
let db

MongoClient.connect(url, (err, client) => {
	if (err) {
		console.error('Failed to connect to MongoDB:', err)
		return
	}
	db = client.db('activities')
	console.log('Connected to MongoDB')
})

// Enable CORS
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Credentials', 'true')
	res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT')
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers'
	)

	next()
})

// Logging middleware
app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`)
	next()
})

// Middleware to handle :collectionName parameter
app.param('collectionName', (req, res, next, collectionName) => {
	if (!db) {
		return res.status(503).send('Database not connected')
	}
	req.collection = db.collection(collectionName)
	return next()
})

// Routes

// Search route
app.get('/collection/:collectionName/search', (req, res) => {
	const queryStr = req.query.q
	if (!queryStr) return res.status(400).json({ msg: 'Query required' })

	let searchConditions = [
		{ title: { $regex: queryStr, $options: 'i' } },
		{ location: { $regex: queryStr, $options: 'i' } },
		{ day: { $regex: queryStr, $options: 'i' } },
	]

	const numberQuery = parseInt(queryStr)
	if (!isNaN(numberQuery)) {
		searchConditions.push({ price: numberQuery })
		searchConditions.push({ availableInventory: numberQuery })
	}
	const query = {
		$or: searchConditions,
	}

	req.collection.find(query).toArray((error, results) => {
		if (error) return res.status(500).send(error.message)
		res.send(results)
	})
})

// Get all documents in a collection
app.get('/collection/:collectionName', (req, res) => {
	req.collection.find({}).toArray((error, results) => {
		if (error) return res.status(500).send(error.message)
		res.send(results)
	})
})

// Create an order
app.post('/collection/:collectionName', (req, res) => {
	req.collection.insertOne(req.body)
	res.json({ status: 'ok' })
})

// Update a document
app.put('/collection/:collectionName/:id', (req, res) => {
	const { id } = req.params
	const stock = Number(req.body.stock)
	if (!ObjectId.isValid(id)) {
		return res.status(400).send('Invalid ID')
	}
	console.log(id)
	req.collection.updateOne(
		{ _id: new ObjectId(id) },
		{ $inc: { availableInventory: stock } },
		(err, result) => {
			if (err) {
				return res.status(500).send('Error updating document')
			}
			res.json({ status: 'ok' })
		}
	)
})

app.listen(3000, () => {
	console.log('Server is running on port 3000')
})
