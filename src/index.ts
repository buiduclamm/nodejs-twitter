import express, { Request, Response, NextFunction } from 'express'
import userRouter from '~/routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'

const app = express()
const port = 3000

app.use(express.json()) // for parsing application/json
databaseService.connect()

app.get('/', (req, res) => {
	res.send('Hello world!')
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})

app.use('/users', userRouter)

// Error handling middleware
// This middleware should be defined after all routes and before the app.listen() call
app.use(defaultErrorHandler);
