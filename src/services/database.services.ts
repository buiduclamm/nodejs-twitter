import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema';
import RefreshToken from '~/models/schemas/RefreshToken.schema';

config();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@nodejs.gmowgyv.mongodb.net/?retryWrites=true&w=majority&appName=NodeJS`;

class DatabaseService {
	private client: MongoClient;
	private db: Db;

	constructor() {
		this.client = new MongoClient(uri, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			},
			autoSelectFamily: false, // Explicitly disable auto selection of IP family
		});

		this.db = this.client.db(process.env.DB_NAME); // Initialize db with the database name
	}

	async connect() {
		try {
			// Send a ping to confirm a successful connection
			await this.db.command({ ping: 1 });
			console.log("Pinged your deployment. You successfully connected to MongoDB!");
		} 
		catch (error) {
			console.error("Error connecting to MongoDB:", error);
		}
	}

	get users(): Collection<User> {
		return this.db.collection(process.env.DB_USER_COLLECTION as string); // Return the users collection
	}

	get refreshTokens(): Collection<RefreshToken> {
		return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string); // Return the refresh tokens collection
	}
}

// Create a new instance of the DatabaseService class
const databaseService = new DatabaseService();

// Export the instance for use in other modules
export default databaseService;