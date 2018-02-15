var mongoose = require('mongoose');
var express = require('express');

var userRouter = express.Router();
var userModel = mongoose.model('User');
var responseGenerator = require('./../../libs/responseGenerator.js');
var auth = require('./../../middlewares/auth.js');
var helmet =require('helmet');
var nodemailer = require('nodemailer');
module.exports.controller = function(app){
  userRouter.use(helmet());
  userRouter.get('/',function(req,res){
    res.render('login');
  }); //end login screen
  userRouter.get('/signup',function(req,res){
    res.render('signup');
  });// end of sign up screen

  userRouter.get('/profile',auth.checkLogin,function(req,res){

      res.render('profile',{user:req.session.user,cart:req.session.cart});

  });//end of dashboard screen
  userRouter.get('/change',function(req,res){
    res.render('changePassword',{user:req.session.user, cart:req.session.cart});
  });
  userRouter.get('/forgot',function(req,res){
    res.render('forgotPassword',{user:req.session.user});
  });
  userRouter.get('/linkyfy',function(req,res){
    res.render('linkChange',{user:req.session.user});
  });


  userRouter.post('/email',function(req,res){
    userModel.findOne({$and:[{'email':req.body.email}]},function(err,foundUser){
      if(err){
          var myResponse = responseGenerator.generate(true,err,403,null);
          res.render(myResponse);
      }else if (foundUser == null || foundUser == undefined || foundUser.name == undefined) {
        var myResponse= responseGenerator.generate(true,"user not found, check your Email ID ",404,null);
        //res.render(myResponse);
        console.log(myResponse.message);
        res.render('error',{

          message:myResponse.message,
          error:myResponse.data,
          user:req.session.user,
          cart:req.session.cart
        });
      }else {

      let transporter = nodemailer.createTransport({
         host: 'smtp.gmail.com',
         port: 587,
         secure: false, // true for 465, false for other ports
         auth: {
             user: 'Enter Your Email ID', // generated ethereal user
             pass: 'Enter your Email ID Password'  // generated ethereal password
         },
         tls:{
           rejectUnauthorized:false
         }
      });


      let mailOptions = {
         from: '" Shoppers-Stop 👻" <pranathip44@gmail.com>', // sender address
         to: req.body.email, // list of receivers ${req.body.email}
         subject: ' Password For Shopper-Stop Login', // Subject line
         text: 'your password is : req.password' , // plain text body
         html: ' Click On This Link To Change The Password : http://localhost:3000/linkyfy'    // html body
      };
      transporter.sendMail(mailOptions, (error, info) => {
         if (error) {
             return console.log(error);
         }
         console.log('Message sent: %s', info.messageId);

         console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

         res.render('login',
            {
              message:"Your Password has been sent to your Email ID",
              user:req.session.user
            });
          });
      }
    });
  });
  userRouter.post('/send',function(req,res){

    let transporter = nodemailer.createTransport({
       host: 'smtp.gmail.com',
       port: 587,
       secure: false, // true for 465, false for other ports
       auth: {
           user: 'pranathip44@gmail.com', // generated ethereal user
           password: 'edwisor'  // generated ethereal password
       },
       tls:{
         rejectUnauthorized:false
       }
   });
   let mailOptions = {
       from: '" Shoppers-Stop 👻" <pranathip44@gmail.com>', // sender address
       to: '<%= product.email%>', // list of receivers ${req.body.email}
       subject: ' Password For Shopper-stop Login', // Subject line
       text: 'your password is : <%= product.password %>' , // plain text body
       html: output  // html body
   };
   transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
           return console.log(error);
       }
       console.log('Message sent: %s', info.messageId);

       console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

       res.render('forgotPassword',
          {
            message:"Your Password has been sent to your Email ID",
            user:req.session.user
          });
   });
  });
userRouter.put('/change/:id',auth.checkLogin,function(req,res){
  var update = req.body;
  userModel.findOneAndUpdate({'_id':req.params.id},update,function(err,password){
    if(err){
      console.log(err);
      res.render('error',
                    {

                      message:"Something went wrong during product update process.",

                      error:err,
                      user:req.session.user,
                      cart:req.session.cart
                    });
    }else if(password === undefined || password === "null" || password === ""){
      res.render('error',
                    {

                      message:"Something went wrong during product update process.",

                      error:err,
                      user:req.session.user,
                      cart:req.session.cart
                    });
    }else{
      console.log("change password success");
      userModel.findOne({'_id':req.params.id},function(err,change){


        res.render('profile',{
          user:req.session.user,
          cart:req.session.cart,
          user:change
        });
      });
    }
  });
});


  userRouter.get('/logout',function(req,res){
    req.session.destroy(function(err){
    res.redirect('/');
    });
  });
  userRouter.get('/all',function(req,res){
    userModel.find({},function(err,allUsers){
      if(err){
        res.send(err);
      }else{
        res.send(allUsers);
      }
    });//end userModel find
  });//end get all user

  userRouter.post('/users/signup',function(req,res){
    if(req.body.name!=undefined && req.body.email!=undefined && req.body.mobileno!=undefined && req.body.password!=undefined && req.body.bdate!=undefined && req.body.gender!=undefined ){
      var newUser =new userModel({

        name            :   req.body.name,
        email           :   req.body.email,
        mobileno        :   req.body.mobileno,
        password        :   req.body.password,
        bdate           :   req.body.bdate,
        gender          :   req.body.gender
      }); //end new user

      newUser.save(function(err){
        if(err){
          console.log("errrrrrrrrrrrrrr");
          var myResponse = responseGenerator.generate(true,err,500,null);
        //  res.render(myResponse);
         res.render('error',{
           message:myResponse.message,
           error:myResponse.data,
           user:req.session.user,
           cart:req.session.cart
         });

        }else{
          console.log("success");
        //    var myResponse = responseGenerator.generate(false,"The User Is Registered Successfully",200,newUser);
              req.session.user =newUser;
              //delete the password from session information
              delete req.session.user.password;
              res.redirect('/dashboard');

        }
      });// end new user save

    }else{
      var myResponse = {
        error : true,
        message : "some body parameter is missing"  ,
        status : 403,
        data : null
      };
      res.render(myResponse);
    }
  });

  userRouter.post('/users/login', function(req,res){
    userModel.findOne({$and:[{'email':req.body.email},{'password':req.body.password}]},function(err,foundUser){
      if(err){
          var myResponse = responseGenerator.generate(true,err,403,null);
          res.render(myResponse);
      }else if (foundUser == null || foundUser == undefined || foundUser.name == undefined) {
        var myResponse= responseGenerator.generate(true,"user not found, check your Email ID OR Password",404,null);
        //res.render(myResponse);
        console.log(myResponse.message);
        res.render('error',{

          message:myResponse.message,
          error:myResponse.data,
          user:req.session.user,
          cart:req.session.cart
        });
      }else {
      //    var myResponse =responseGenerator.generate(false,"Login Successfully",200,foundUser);
        //  res.render(myResponse);
        console.log("user found");
        req.session.user = foundUser;
        delete req.session.user.password;
        res.redirect('/dashboard');
      }
    }); //end find
  });// end login api
  userRouter.post('/link',function(req,res){
    userModel.findOne({$and:[{'email':req.body.email}]},function(err,foundUser){
      if(err){
          var myResponse = responseGenerator.generate(true,err,403,null);
          res.render(myResponse);
      }else if (foundUser == null || foundUser == undefined || foundUser.name == undefined) {
        var myResponse= responseGenerator.generate(true,"user not found, check your Email ID ",404,null);
        //res.render(myResponse);
        console.log(myResponse.message);
        res.render('error',{

          message:myResponse.message,
          error:myResponse.data,
          user:req.session.user,
          cart:req.session.cart
        });
      }else {
      //    var myResponse =responseGenerator.generate(false,"Login Successfully",200,foundUser);
        //  res.render(myResponse);
        console.log("user found");
        req.session.user = foundUser;
        delete req.session.user.password;
        res.render('changePassword',{user:req.session.user, cart:req.session.cart});
      }
    }); //end find
  });// end login api
  app.use('/', userRouter);
}