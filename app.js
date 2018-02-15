var express= require('express');
var app = express();
var mongoose = require('mongoose');
var server = require('http').createServer( app )
var passport = require('passport');
var util =require('util');
var bodyParser= require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger =require('morgan');
var path=require('path');
var fs = require('fs');
var helmet = require('helmet');
//var model       = require('./models/user');
var userRouter =express.Router();
var methodOverride = require('method-override');


//--------------------------------------------------cartGenerator-----------------------------

app.use(require('morgan')('combined'));

//-------------------------------------------------------------------
app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());
var cart = require('./libs/cartGenerator');
app.use(session({
 name :  'my cart',
 secret : 'myAppSecret', //encryption key
 resave : true,
 httpOnly :  true,// to prevent cookie forgery
 saveUninitialized : true,
 cookie : { secure : false} //make it true in case of ssl
}));

app.use(function(req,res,next){
  var minusCart = req.session.cart;
  req.session.cart = cart.cartSlot(minusCart);
  req.cart = req.session.cart;
  next();
});
//----------------------------------for put method----------------------------------------
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));
//-----------------------Database work---------------------------------------//
var dbPath="mongodb://localhost/robustApp";

db = mongoose.connect(dbPath);
mongoose.connection.once('open',function(){
  console.log('Connected To Database Successfully!');
});
//-----------------------------------------
//configure view engine to render EJS templates
app.set('views',path.join(__dirname + '/app/views'));
app.set('view engine', 'hbs');
//cmd- npm install hbs --save

//-----------------------------------------------------------

//------------recognised JS file--------------------------------

fs.readdirSync('./app/models').forEach(function(file){
  if(file.indexOf('.js'))

  require('./app/models/'+file);
});

fs.readdirSync('./app/controllers').forEach(function(file){
  if(file.indexOf('.js')){
    var route = require('./app/controllers/'+file);

  //  route.controller(app);

  }
});

//including auth file
var auth = require('./middlewares/auth.js');

//----------------------------------------------
//var mongoose = require('mongoose');
var userModel = mongoose.model('User');

//set the middleware as app level middleware
app.use(function(req,res,next){
// checks wheather the session and session.user is exits or not
  if(req.session && req.session.user){
    userModel.findOne({'email':req.session.user.email},function(err,user){
      if(user){
        //req.user = user;
        //delete req.user.password;
        req.session.user = user;
         //deleting password
        delete req.session.user.password;
        next();

      }else{

      }
    });
  }else{
    next();
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/',function(req,res){
  res.render('login',{user:req.session.user,cart:req.session.cart});
});

app.get('/addProduct',function(req,res){
  res.render('addProduct',{user: req.session.user,cart:req.session.cart});
});



app.get('/profile',function(req,res){
  res.render('profile',{user: req.session.user,cart:req.session.cart});
});

app.get('/dashboard',function(req,res){
  res.render('dashboard',{user:req.session.user,cart:req.session.cart});
});
app.get('/logout',function(req,res){
   req.logout();
  res.redirect('/');
});

app.get('/signup',function(req,res){
  res.render('signup');
});


//------------------------------------error detect---------------------------
app.use(function(err,req,res,next){
  res.status(err.status || 500);
  res.render('error',{
    message:err.message,
    error:err,
    user:req.session.user,
    cart:req.session.cart
  });
});
app.use(function(err,req,res,next){
  res.status(err.status || 404);
  res.render('error',{
    message:err.message,
    error:err,
    user:req.session.user,
    cart:req.session.cart
  });
});
//-------------------------localhost--------------------------------
app.listen(3000, function(){
  console.log('Example app listening on port 3000!')
 });
//--------------------Google Authentication--------------------------

function ensureAuthenticated(req,res,next){
   if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}
