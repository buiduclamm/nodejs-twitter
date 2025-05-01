import jwt from 'jsonwebtoken';

export const signToken = ({ payload, privateKey = process.env.JWT_SECRET as string, options = { algorithm: 'HS256' } }:
	{
		payload: string | object | Buffer;
		privateKey?: string;
		options?: jwt.SignOptions
	}) => {
	return new Promise<string>((resolve, reject) => {
		jwt.sign(payload, privateKey, options, (error, token) => {
			if (error) {
				reject(new Error('Error signing token: ' + error.message));
			}
			else {
				resolve(token as string);
			}
		})
	})
}