import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema';
import HTTP_STATUS from '~/constants/httpStatus';
import { EntityError, ErrorWithStatus } from '~/models/Errors';

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
		await validation.run(req);

		const errors = validationResult(req);

		// if there are no errors, go to the next middleware
		if (errors.isEmpty()) {
			return next();
		}

		const errorsObject = errors.mapped(); // get all errors in the request
		const entityError = new EntityError({ errors: {} })

		for (const key in errorsObject) {
			const { msg } = errorsObject[key];

			// Return the error if it is not a validation error
			if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
				return next(msg); // if the error is not a validation error, pass it to the next middleware
			}

			entityError.errors[key] = errorsObject[key];
		}

    next(entityError);
  };
};