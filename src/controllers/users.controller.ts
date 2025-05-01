import {Request, Response} from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterRequestBody } from '~/models/requests/User.request'
import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
	const { email, password } = req.body

	res.status(200).json({ message: 'Login successful', email })	
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterRequestBody>, res: Response) => {
	try {
		const result = await usersService.register(req.body);
		res.status(201).json({ message: 'User registered successfully', result })
	}
	catch (error) {
		console.error('Error inserting user:', error)
		res.status(400).json({ message: error })
		
		return; // Need to return void, not return the response object
	}
}