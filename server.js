const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongo = require("mongodb");
const cors = require('cors');

const mongoose = require('mongoose');
//mongoose.createConnection(process.env.MLAB_URI || 'mongodb://localhost/exercise-track');
mongoose.connect("mongodb://localhost/exercisedb1");
var db = mongoose.connection;

db.once('open',function(){console.log("DB connected!");})
.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(cors());

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

//---------------------------------------------------------------

var exerciseSchema = mongoose.Schema({
  description: String,
  duration: Number,
  date: {type: Date, default: Date.now}
});

var Exercise = mongoose.model("Exercise",exerciseSchema);

var userSchema = mongoose.Schema({
    username: String,
    userId: String,
    exercises:[exerciseSchema]
});

var User = mongoose.model("User", userSchema);

//retrieving all the users
app.get("/api/exercise/users", function(req,res){
  User.find({}, function(err,users){
    if(err){
      console.log("ERROR");
    }else{
      res.json(users);
    }
  });
});

//retrieving one user
app.get("/api/exercise/log", function(req,res){
  var uId = req.query.userId
  User.findOne({userId:uId}, function(err,user){
    if(err){
      console.log("ERROR");
    }else{
      res.json(user);
    }
  })
});

//adding a user
app.post("/api/exercise/new-user", function(req,res){
    var uId = req.body.username.substring(0,2) + (Math.floor(Math.random()*1000000));
    User.create({
        username : req.body.username,
        userId : uId
      }, function(err, user){
        if(err){
            console.log("ERROR");
        }else{
            res.json(user);
        }
    });
});

//adding exercise to the user
app.post("/api/exercise/add", function(req, res){
   var uId = req.body.userId;

   User.findOne({userId:uId},function(err,user){
     if(err){
       console.log("ERROR");
     }else{
       Exercise.create({
         description : req.body.description,
         duration : req.body.duration,
         date : req.body.date
       }, function(err, exercise){
         if(err){
           console.log(err);
         }else{
           user.exercises.push(exercise);
           user.save();
       res.json(user);
     }
    });
  }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
