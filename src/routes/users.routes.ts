import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controller'
import { loginValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, loginController)

/**
 * Desc: Register a new user
 * Path: /register
 * Method: POST
 * Body { name: string, email: string, password: string, confirm-password: string, date_of_birth: ISO8601 Date }
 */
usersRouter.post('/register', registerController)

export default usersRouter