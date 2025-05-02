import { Request } from "express";
import User from "./models/schemas/User.schema";

// Extend the Request interface to include the user property
declare module 'express' {
	interface Request {
		user?: User
	}
}