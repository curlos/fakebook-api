const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const authRoute = require('./routes/auth')
const userRoute = require('./routes/users')
const postRoute = require('./routes/posts')

dotenv.config()

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log('Connected to MongoDB')
  }
)

// middleware
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))

// routes
app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
app.use('/api/posts', postRoute)

app.listen(process.env.PORT || 8888, () => {
  console.log(`Server is running on port ${process.env.PORT || 8888}`)
})