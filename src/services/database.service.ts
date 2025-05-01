import { MongoClient, ServerApiVersion } from 'mongodb';
import { config } from 'dotenv'

config();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@nodejs.gmowgyv.mongodb.net/?retryWrites=true&w=majority&appName=NodeJS`;

class DatabaseService {
	private client: MongoClient;

	constructor() {
		this.client = new MongoClient(uri, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			},
			autoSelectFamily: false, // Explicitly disable auto selection of IP family
		});
	}

	async connect() {
		try {
			// Send a ping to confirm a successful connection
			await this.client.db("Twitter").command({ ping: 1 });
			console.log("Pinged your deployment. You successfully connected to MongoDB!");
		} 
		finally {
			// Ensures that the client will close when you finish/error
			await this.client.close();
		}
	}
}

// Create a new instance of the DatabaseService class
const databaseService = new DatabaseService();

// Export the instance for use in other modules
export default databaseService;