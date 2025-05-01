import express from 'express'
import userRouter from '~/routes/users.routes'

const app = express()
const port = 3000

app.use(express.json()) // for parsing application/json

app.get('/', (req, res) => {
	res.send('Hello world!')
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})

app.use('/users', userRouter)