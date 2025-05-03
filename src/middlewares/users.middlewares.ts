import { verify } from "crypto";
import { Request, Response, NextFunction } from "express";
import { checkSchema } from "express-validator";
import HTTP_STATUS from "~/constants/httpStatus";
import { USERS_MESSAGE } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/Errors";
import databaseService from "~/services/database.services";
import usersService from "~/services/users.services";
import { hashPassword } from "~/utils/crypto";
import { verifyToken } from "~/utils/jwt";
import { validate } from "~/utils/validation";

export const loginValidator = validate(checkSchema({
	email: {
		notEmpty: {
			errorMessage: USERS_MESSAGE.EMAIL_IS_REQUIRED,
		},
		isEmail: {
			errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID,
		},
		isString: {
			errorMessage: USERS_MESSAGE.EMAIL_MUST_BE_STRING,
		},
		trim: true,
		custom: {
			options: async (value: string, { req }) => {
				const user = await databaseService.users.findOne({ email: value, password: hashPassword(req.body.password) });

				if (!user) {
					throw new Error(USERS_MESSAGE.EMAIL_OR_PASSWORD_IS_INCORRECT)
				}
				else {
					req.user = user;
				}

				return true
			}
		},
	},
	password: {
		notEmpty: {
			errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED,
		},
		isString: {
			errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRING,
		},
	}
}, ['body']))

export const registerValidator = validate(checkSchema({
	name: {
		notEmpty: {
			errorMessage: USERS_MESSAGE.NAME_IS_REQUIRED,
		},
		trim: true,
		isString: {
			errorMessage: USERS_MESSAGE.NAME_MUST_BE_STRING,
		},
		isLength: {
			options: {
				min: 6,
				max: 100
			},
			errorMessage: USERS_MESSAGE.NAME_LENGTH,
		}
	},
	email: {
		notEmpty: {
			errorMessage: USERS_MESSAGE.EMAIL_IS_REQUIRED,
		},
		isEmail: {
			errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID,
		},
		isString: {
			errorMessage: USERS_MESSAGE.EMAIL_MUST_BE_STRING,
		},
		trim: true,
		custom: {
			options: async (value: string) => {
				const user = await usersService.checkEmailExists(value)
				if (user) {
					throw new Error(USERS_MESSAGE.EMAIL_ALREADY_EXISTS)
				}

				return true
			}
		},
	},
	password: {
		notEmpty: {
			errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED,
		},
		isString: {
			errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRING,
		},
		isLength: {
			options: {
				min: 6,
				max: 50
			},
			errorMessage: USERS_MESSAGE.PASSWORD_LENGTH,
		},
		isStrongPassword: {
			options: {
				minLength: 6,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 1
			},
			errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRONG,
		},
	},
	confirm_password: {
		notEmpty: {
			errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_IS_REQUIRED,
		},
		isString: {
			errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRING,
		},
		isLength: {
			options: {
				min: 6,
				max: 50
			},
			errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_LENGTH,
		},
		isStrongPassword: {
			options: {
				minLength: 6,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 1
			},
			errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRONG,
		},
		custom: {
			options: (value, {req}) => {
				if (value !== req.body.password) {
					throw new Error(USERS_MESSAGE.CONFIRM_PASSWORD_MUST_MATCH)
				}

				return true
			}
		}
	},
	date_of_birth: {
		notEmpty: {
			errorMessage: USERS_MESSAGE.DATE_OF_BIRTH_IS_REQUIRED,
		},
		isISO8601: {
			options:  {
				strict: true,
				strictSeparator: true,
			},
			errorMessage: USERS_MESSAGE.DATE_OF_BIRTH_MUST_BE_VALID,
		}
	}
}, ['body']))

export const accessTokenValidator = validate(checkSchema({
		Authorization: {
			in: ['headers'],
			notEmpty: {
				errorMessage: USERS_MESSAGE.ACCESS_TOKEN_IS_REQUIRED,
			},
			isString: {
				errorMessage: USERS_MESSAGE.ACCESS_TOKEN_MUST_BE_STRING,
			},
			trim: true,
			custom: {
				options: async (value, { req }) => {
					if (!value.startsWith('Bearer ')) {
						throw new ErrorWithStatus({ message: USERS_MESSAGE.ACCESS_TOKEN_MUST_START_WITH_BEARER, status: HTTP_STATUS.UNAUTHORIZED })
					}
					req.access_token = value.split(' ')[1];

					try {
						const decodedAccessToken = await verifyToken({ token: req.access_token });
						(req as Request).decodedAccessToken = decodedAccessToken;
					}
					catch (error) {
						throw new ErrorWithStatus({ message: USERS_MESSAGE.ACCESS_TOKEN_INVALID, status: HTTP_STATUS.UNAUTHORIZED });
					}

					return true
				}
			}
		},
	}, ['headers']
))

export const refreshTokenValidator = validate(checkSchema({
		refresh_token: {
			in: ['body'],
			notEmpty: {
				errorMessage: USERS_MESSAGE.REFRESH_TOKEN_IS_REQUIRED,
			},
			isString: {
				errorMessage: USERS_MESSAGE.REFRESH_TOKEN_MUST_BE_STRING,
			},
			trim: true,
			custom: {
				options: async (value, { req }) => {
					try {
						const [decodedRefreshToken, tokenRecord] = await Promise.all([
							verifyToken({ token: value }),
							databaseService.refreshTokens.findOne({ token: value })
						])

						if (!tokenRecord) {
							throw new ErrorWithStatus({ message: USERS_MESSAGE.REFRESH_TOKEN_NOT_FOUND, status: HTTP_STATUS.UNAUTHORIZED });
						}

						(req as Request).decodedRefreshToken = decodedRefreshToken;
					}
					catch (error) {
						throw new ErrorWithStatus({ message: USERS_MESSAGE.REFRESH_TOKEN_NOT_FOUND, status: HTTP_STATUS.UNAUTHORIZED });
					}

					return true
				}
			}
		},
	}, ['body']
))