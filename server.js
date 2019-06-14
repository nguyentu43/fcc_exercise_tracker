const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const shortid = require('shortid')
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  _id: {
    'type': String,
    'default': shortid.generate
  }
});
const User = mongoose.model('User', userSchema);

const exerciseSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  _id: {
    'type': String,
    'default': shortid.generate
  }
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

app.get('/api/exercise/log', function(req, res){
  
});
app.post('/api/exercise/new-user', function(req, res, next){
  const username = req.body.username;
  const user = new User({
    username
  });
  user.save(function(err, user){
    if(err) return next(err);
    res.json({ username: user.username, _id: user._id });
  });
  
});
app.post('/api/exercise/add', function(req, res){
  
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
