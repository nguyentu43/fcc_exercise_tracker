const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const moment = require('moment');
const shortid = require('shortid')
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/exercise-track' )
const userSchema = mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    _id: {
      type: String,
      default: shortid.generate
    }
  }, { versionKey: false });
const User = mongoose.model('User', userSchema);

const exerciseSchema = mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
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
    default: moment().format('YYYY-MM-DD')
  },
  _id: {
    'type': String,
    'default': shortid.generate
  }
}, { versionKey: false });
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/exercise/log', function(req, res, next){
  const userId = req.query.userId;
  if(!userId) return next(new Error('unknown userId'));
  User.findOne({_id: userId}, function(err, user){
    if(err) return next(err);
    req.user = user;
    next();
  });
}, function(req, res, next){
  const { from, to, limit } = req.query;
  const query = Exercise.where({userId: req.user.id});
  const result = {};
  if(from) {
    query.where({ date: { $gte: from } });
    result.from = moment(from).format("ddd MMM DD YYYY");
  }
  if(to) {
    query.where({ date: { $lte: to } });
    result.to = moment(to).format("ddd MMM DD YYYY");
  }
  if(limit) query.limit(limit);
  
  query.exec(function(err, data){
    if(err) return next(err);
    data = data.map(function(item) { 
      let tmp = item.toObject();
      tmp.date = moment(tmp.date).format("ddd MMM DD YYYY");
      return tmp;
    });
    
    result = {
      ...req.user,
      count: data.length,
      log: data,
      ...result
    };
    res.json(result);
  });
});
app.post('/api/exercise/new-user', function(req, res, next){
  const username = req.body.username;
  const user = new User({
    username
  });
  user.save(function(err, user){
    if(err) return next(err);
    res.json(user);
  });
});
app.post('/api/exercise/add', function(req, res, next){
  if(!req.body.date)
    delete req.body.date;
  const exercise = new Exercise({ ...req.body });
  exercise.save(function(err, exercise){
    if(err) return next(err);
    exercise = exercise.toObject();
    exercise.date = moment(exercise.date).format("ddd MMM DD YYYY");
    res.json(exercise);
  });
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
