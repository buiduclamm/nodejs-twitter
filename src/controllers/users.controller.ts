import {Request, Response} from 'express'

export const loginController = (req: Request, res: Response) => {
	const { email, password } = req.body

	res.status(200).json({ message: 'Login successful', email })	
}

export const registerController = (req: Request, res: Response) => {
	const { email, password } = req.body

	res.status(201).json({ message: 'User registered successfully', email })
}