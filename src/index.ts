import express from 'express'
import userRouter from '~/routes/users.routes'
import databaseService from './services/database.services'

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