import express, { Request, Response, NextFunction, RequestHandler } from 'express'

export const wrapRequestHandler = (func: RequestHandler) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		// Promise.resolve(func(req, res, next)).catch(next); // This line is a shorthand for handling async errors in Express. But not work for normal functions.

		try {
			await func(req, res, next);
		} 
		catch (error) {
			next(error);
		}
	}
}