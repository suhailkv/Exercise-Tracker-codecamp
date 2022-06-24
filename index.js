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

app.get('/api/users/:userId/logs',async(req,res)=>{

  console.log(req.query.from,req.query.to,req.query.limit)
  
  const userId = req.params.userId;
  const from = req.query.from === undefined ? new Date('0001-01-01'):new Date(req.query.from)
  const to = req.query.to ===undefined ?  new Date('9999-01-01'):new Date(req.query.to)

  const limit = parseInt(req.query.limit) || 0;

  let user = await User.find({_id:userId});
  if(!user){
    return console.log(Error)
  }
  let excercise = await Excercise.find({username:userId}).where('date').gte(from).lte(to).limit(limit);
  if(!excercise){
    return console.log(Error)
  }
  let log=[]
  
  excercise.filter(obj=>{
    obj = obj.toObject();
    obj.date=obj.date.toDateString();
    obj._id = undefined;
    obj.username = undefined;
    obj.__v = undefined;
    log.push(obj)
  })

  
  user = user[0].toObject();
  user.count = log.length;
  user.log= log
  user.__v = undefined
  user.from = req.query.from === undefined ? undefined :new Date(req.query.from).toDateString()
  user.to = req.query.to === undefined ? undefined :new Date(req.query.to).toDateString()
  
  
  return res.json(user);
 

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
