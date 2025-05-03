import { Router } from 'express'
import { access } from 'fs'
import { verifyEmailController, loginController, logoutController, registerController, resendVerifyEmailController } from '~/controllers/users.controller'
import { accessTokenValidator, emailVerifyTokenValidator, loginValidator, refreshTokenValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

/**
 * Desc: Login a user
 * Path: /login
 * Method: POST
 * Body { email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Desc: Register a new user
 * Path: /register
 * Method: POST
 * Body { name: string, email: string, password: string, confirm-password: string, date_of_birth: ISO8601 Date }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

/**
 * Desc: Logout a user
 * Path: /logout
 * Method: POST
 * Headers { Authorization: Bearer <access_token> }
 * Body { refresh_token: string }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Desc: Verify email
 * Path: /verify-email
 * Method: POST
 * Body { email_verify_token: string }
 */
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))

/**
 * Desc: Resend email verification
 * Path: /resend-verify-email
 * Method: POST
 * Headers { Authorization: Bearer <access_token> }
 * Body {}
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))

export default usersRouter