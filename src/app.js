const express = require('express')
const userRouter = require('./routes/user')
const postRouter = require('./routes/post')

const app = express()
require('./db/db')

const port = process.env.PORT


app.use(express.json())
app.use(userRouter)
app.use(postRouter)



app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})