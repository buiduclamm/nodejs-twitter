import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGE } from '~/constants/messages'
import { LogoutRequestBody, RegisterRequestBody, TokenPayload, VerifyEmailRequestBody } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = async (req: Request, res: Response) => {
	const user = req.user as User; // user is set in the middleware
	const user_id = user._id.toString();

	const result = await usersService.login(user_id);
	res.status(200).json({ message: USERS_MESSAGE.LOGIN_SUCCESS, result });
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
	const result = await usersService.register(req.body);
	res.status(201).json({ message: USERS_MESSAGE.REGISTER_SUCCESS, result })
	return;
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutRequestBody>, res: Response) => {
	const { refresh_token } = req.body;
	const result = await usersService.logout(refresh_token);
	
	res.status(200).json(result);
}

export const emailVerifyTokenController = async (req: Request<ParamsDictionary, any, VerifyEmailRequestBody>, res: Response) => {
	const { user_id } = req.decodedEmailVerifyToken as TokenPayload
	const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });

	if (!user) {
		res.status(404).json({ message: USERS_MESSAGE.USER_NOT_FOUND });
		return;
	}

	// Already verified -> return 200 OK
	if (user.email_verify_token === '') {
		res.status(200).json({ message: USERS_MESSAGE.EMAIL_VERIFIED });
		return;
	}

	if (user.email_verify_token !== req.body.email_verify_token) {
		res.status(400).json({ message: USERS_MESSAGE.EMAIL_VERIFY_TOKEN_IS_INVALID });
		return;
	}

	user.email_verify_token = '';
	const result = await usersService.verifyEmail(user._id.toString());
	
	res.status(200).json({ message: USERS_MESSAGE.EMAIL_VERIFY_SUCCESS, result });
}