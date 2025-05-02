import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controller'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)

/**
 * Desc: Register a new user
 * Path: /register
 * Method: POST
 * Body { name: string, email: string, password: string, confirm-password: string, date_of_birth: ISO8601 Date }
 */
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

export default usersRouter