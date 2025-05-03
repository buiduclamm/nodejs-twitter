import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import HTTP_STATUS from '~/constants/httpStatus';
import { ErrorWithStatus } from '~/models/Errors';
import { TokenPayload } from '~/models/requests/User.request';
config();

export const signToken = ({ payload, privateKey = process.env.JWT_SECRET as string, options = { algorithm: 'HS256' } }:
	{
		payload: string | object | Buffer;
		privateKey?: string;
		options?: jwt.SignOptions
	}) => {
	return new Promise<string>((resolve, reject) => {
		jwt.sign(payload, privateKey, options, (error, token) => {
			if (error) {
				reject(new ErrorWithStatus({ message: error.message, status: HTTP_STATUS.UNAUTHORIZED }));
			}
			else {
				resolve(token as string);
			}
		})
	})
}

export const verifyToken = ({ token, secretKey = process.env.JWT_SECRET as string }: {token: string; secretKey?: string}) => {
	return new Promise<TokenPayload>((resolve, reject) => {
		jwt.verify(token, secretKey, (error, decoded) => {
			if (error) {
				reject(new ErrorWithStatus({ message: error.message, status: HTTP_STATUS.UNAUTHORIZED }));
			}
			else {
				resolve(decoded as TokenPayload);
			}
		})
	})
}