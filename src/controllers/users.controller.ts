import {Request, Response} from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
	const { email, password } = req.body

	res.status(200).json({ message: 'Login successful', email })	
}

export const registerController = async (req: Request, res: Response) => {
	const { email, password } = req.body

	try {
		const result = await usersService.register({ email, password });

		res.status(201).json({ message: 'User registered successfully', result })
	}
	catch (error) {
		console.error('Error inserting user:', error)
		return res.status(400).json({ message: error })
	}
}