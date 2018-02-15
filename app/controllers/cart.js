var mongoose = require('mongoose');
var express = require('express');

var userRouter = express.Router();
var userModel = mongoose.model('User');
var productModel = mongoose.model('Product');
var cart = require('./../../libs/cartGenerator');
var responseGenerator = require('./../../libs/responseGenerator.js');
var auth = require('./../../middlewares/auth.js');
module.exports.controller_1 = function(app){
userRouter.get('/cart',function(req,res){
  res.render('viewCart',{user: req.session.user, cart:req.session.cart});
});

userRouter.get('/cart/empty',function(req,res){
  delete req.session.cart;
  res.redirect('/cart');
});

userRouter.get('/cart/:id/add',function(req,res){
  productModel.findOne({'_id':req.params.id},function(err,add){
    if(err){
      console.log(err);
      var myResponse = responseGenerator.generate(true,err,500,null);
    //  res.render(myResponse);
        res.render('error',{
            message:myResponse.message,
            error:myResponse.data,
            user:req.session.user,
            cart:req.session.cart
          });
    }else if(add == undefined || add == null || add == ""){
      var myResponse = responseGenerator.generate(true,err,500,null);
    //  res.render(myResponse);
        res.render('error',{
            message:myResponse.message,
            error:myResponse.data,
            user:req.session.user,
            cart:req.session.cart
          });
    }else{
      var minusCart = req.session.cart;
      req.session.cart = cart.addProduct(minusCart,add,req.params.id);
      req.cart = req.session.cart;

      res.redirect('/cart');
    }
  });

  userRouter.get('/cart/:id/addone',function(req,res){
    var minusCart =req.session.cart;
    req.session.cart = cart.addOne(minusCart,req.params.id);
    req.cart = req.session.cart;

    res.redirect('/cart');
  });
});

userRouter.get("/cart/:id/delete",function(req,res){

  var minusCart = req.session.cart;
  req.session.cart = cart.deleteProduct(minusCart,req.params.id);
  req.cart = req.session.cart;

  res.redirect("/cart");
});

userRouter.get("/cart/:id/deleteOne",function(req,res){

    var minusCart = req.session.cart;
    req.session.cart = cart.deleteOne(minusCart,req.params.id);
    req.cart = req.session.cart;

    res.redirect("/cart");
  });


app.use('/',userRouter);
}
