const { MongoClient } = require('mongodb')
require('dotenv').config()

const client = new MongoClient(process.env.MONGODB_URL)

const start = async () => {
	try {
		await client.connect()
		console.log('Connected to MongoDB')
		await client.db().collection('userrrrr')
		const users = client.db().collection('userrrrr')
		await users.insertOne({ name: 'Efaxy', age: 19 })
		const user = await users.findOne({ name: 'Efaxy' })
		console.log(user)
	} catch (err) {
		console.log(err)
	}
}

start()
