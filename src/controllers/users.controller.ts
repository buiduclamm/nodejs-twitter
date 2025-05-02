import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { USERS_MESSAGE } from '~/constants/messages'
import { RegisterRequestBody } from '~/models/requests/User.request'
import User from '~/models/schemas/User.schema'
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