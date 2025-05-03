import { Request } from "express";
import User from "./models/schemas/User.schema";
import { TokenPayload } from "./models/requests/User.request";

// Extend the Request interface to include the user property
declare module 'express' {
	interface Request {
		user?: User,
		decodedAccessToken?: TokenPayload,
		decodedRefreshToken?: TokenPayload,
		decodedEmailVerifyToken?: TokenPayload,
	}
}