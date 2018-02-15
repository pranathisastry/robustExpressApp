var mongoose = require('mongoose');
var userModel = mongoose.model('User')

//app level middleware to set request user
//to check if its a legitimate user of the system
 module.exports.setLoggedInUser = function(req,res,next){
// checks whether the session and session.user exists or not
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
   
   }
 }

module.exports.checkLogin = function(req,res,next){
  if(!req.session.user){
    //if the user doen't exist, just redirect him on login screen
    res.redirect('/users/login/screen');

  }else {
    //if exist then move forward
    next();
  }
}
