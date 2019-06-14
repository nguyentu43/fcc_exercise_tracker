const router = require('express').Router();
const User = require('./user');
const Exercise = require('./exercise');

router.get('/log', function(req, res){
  
});

router.post('/new-user', function(req, res){
  
  const username = req.body.username;
  const user = new User({
    username
  });
  user.save(function(err, user){
    if(err) return res.send('username already taken');
    res.json({ username: user.username })
  });
});

router.post('/add', function(req, res){
  
});

module.exports = router;