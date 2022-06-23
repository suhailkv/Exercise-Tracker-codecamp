const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}))

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))

// schema
const userSchema = mongoose.Schema({
  username:{
    type:String,
    required:true
  }
})
const User = mongoose.model('User',userSchema)
const excerScheme = mongoose.Schema({
  username:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
},
  description:String,
  duration:Number,
  date:{
    type:Date,
    default:Date.now()
  }
})
const Excercise = mongoose.model('Excercise',excerScheme);
// routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users',(req,res)=>{
  const newUser = new User({
    username:req.body.username
  })
  newUser.save((err,data)=>{
    if(err){
      consol.log(err)
    }
    data.__v = undefined
    res.json(data)
  })
})
app.get('/api/users',(req,res)=>{
  User.find((err,data)=>{
    if(err){
     return console.log(err)
    }
    return res.json(data)
  })
})

app.post('/api/users/:userId/exercises',(req,res)=>{
  const date = req.body.date===''? new Date:req.body.date
  console.log(date)
  const newEx = new Excercise({
    username : req.params.userId || req.body[':_id'],
    description : req.body.description,
    duration : req.body.duration,
    date : date
  })
  newEx.save().then((data)=>{
    User.findOne({_id:data.username}).lean().exec().then((name)=>{
      data = data.toObject()
      data._id= name._id;
      data.username = name.username;
      data.__v = undefined;
      data.date = data.date.toDateString()      
      return res.json(data)
    }).catch(err=>console.log(err))
    
    
  }).catch((err)=>console.log(err))
})

app.get('/api/users/:userId/logs',(req,res)=>{
  const userId = req.params.userId;
  const from = new Date(req.query.from) || 0;
  const to = req.query.to || 0 ;
  const limit = parseInt(req.query.limit) || 0;

  Excercise.countDocuments({username:userId}).then((count)=>{
      Excercise.find({
    username:userId,
    function (){
      if(from !== 0){
        return {
          date:{
            $gt:from,
            $lt:to
          }
        }
      }
      return '';
    }
  }).limit(limit).select('-id').exec((err,log)=>{
        let logData=[];
        for(obj of log){
          obj = obj.toObject()
          obj.date= obj.date.toDateString()
          logData.push(obj)
        }
        
        if(err) console.log(err);
    User.find({_id:userId}).exec((err,data)=>{
      if(err) console.log(err);
      data= data[0].toObject();
      data.count = count;
      data.log = logData;
      res.json(data)
    })
      
    
  })
  }).catch(err=>console.log(err))

})




const mySecret = process.env['URI_STRING']


mongoose.connect(mySecret,(err,data)=>{
  if(err){
    return console.log(err)
  }
  console.log('success')
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
