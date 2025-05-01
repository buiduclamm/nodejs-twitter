import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema';

// can be reused by many routes
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
		await validation.run(req);

		const result = validationResult(req);
		
		// if there are errors, return them in the response
		if (!result.isEmpty()) {
			res.status(400).json({ errors: result.mapped() });
			return;
		}

    next();
  };
};