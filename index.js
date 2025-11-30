const { MongoClient } = require('mongodb')
require('dotenv').config()

const client = new MongoClient(process.env.MONGODB_URL)

const start = async () => {
	try {
		await client.connect()
		console.log('Connected to MongoDB')
	} catch (err) {
		console.log(err)
	}
}

start()
