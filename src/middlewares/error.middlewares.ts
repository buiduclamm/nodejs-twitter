import { Request, Response, NextFunction } from "express"
import { omit } from "lodash";
import HTTP_STATUS from "~/constants/httpStatus";
import { ErrorWithStatus } from "~/models/Errors";

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
	if (err instanceof ErrorWithStatus) {
		return res.status(err.status).json(omit(err, ['status']));
	}

	// Handle the error object to make it enumerable, so it can be sent in the response
	Object.getOwnPropertyNames(err).forEach((key) => {
		Object.defineProperty(err, key, {
			enumerable: true,
		});
	});

	res.status(err.status || 500).json({
		message: err.message,
		errorInfo: err
	});
}