require("dotenv").config();
const mongoose = require("mongoose");

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.bmqx3vg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log("-------------------------");
console.log(uri);

console.log("---------------------------");

const clientOptions = {
	serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function connectDB() {
	try {
		// Create a Mongoose client with a MongoClientOptions object to set the Stable API version
		await mongoose.connect(uri, clientOptions);

		await mongoose.connection.db.admin().command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!",
		);
	} catch (error) {
		console.log("mongoDB connection failed");
		console.log(error);

		process.exit(1);
	}
}

export default connectDB;
