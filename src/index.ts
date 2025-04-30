import express from 'express'
const app = express()
const router = express.Router()
const port = 3000

app.get('/', (req, res) => {
	res.send('Hello world!')
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})

router.use((req, res, next) => {
	console.log('Time: ', Date.now())
	next()
})

router.get('/tweets', (req, res) => {
	res.json({
		data: [{ id: 1, text: 'Hello world' }]
	})
})

app.use('/', router)