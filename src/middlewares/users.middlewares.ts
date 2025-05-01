import { Request, Response, NextFunction } from "express";
import { checkSchema } from "express-validator";
import usersService from "~/services/users.services";
import { validate } from "~/utils/validation";

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
	const { email, password } = req.body
	if (!email || !password) {
		res.status(400).json({
			error: 'Missing email or password'
		})

		return; // Need to return void, not return the response object
	}

	next();
}

export const registerValidator = validate(checkSchema({
	name: {
		notEmpty: true,
		trim: true,
		isLength: {
			options: {
				min: 6,
				max: 100
			}
		}
	},
	email: {
		notEmpty: true,
		isEmail: true,
		trim: true,
		custom: {
			options: async (value: string) => {
				const user = await usersService.checkEmailExists(value)
				if (user) {
					throw new Error('Email already in use')
				}

				return true
			}
		},
		errorMessage: 'Invalid email address',
	},
	password: {
		notEmpty: true,
		isString: true,
		isLength: {
			options: {
				min: 6,
				max: 50
			}
		},
		errorMessage: 'Password must be at least 6 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol',
		isStrongPassword: {
			options: {
				minLength: 6,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 1
			},
		},
	},
	confirm_password: {
		notEmpty: true,
		isString: true,
		isLength: {
			options: {
				min: 6,
				max: 50
			}
		},
		errorMessage: 'Password must be at least 6 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol',
		isStrongPassword: {
			options: {
				minLength: 6,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 1
			},
		},
		custom: {
			options: (value, {req}) => {
				if (value !== req.body.password) {
					throw new Error('Password confirmation does not match password')
				}

				return true
			}
		}
	},
	date_of_birth: {
		notEmpty: false,
		isISO8601: {
			options:  {
				strict: true,
				strictSeparator: true,
			}
		}
	}
}))