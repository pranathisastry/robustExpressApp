var mongoose = require('mongoose');
var express = require('express');
var multer =require('multer');
var bodyParser= require('body-parser');
var fs = require('fs');
var userRouter = express.Router();
var userModel = mongoose.model('Product');
var responseGenerator = require('./../../libs/responseGenerator.js');
var auth = require('./../../middlewares/auth.js');
var methodOverride = require('method-override');
var path=require('path');
   // to use of put method in html forms by using methodOverride put method will work
//var User = mongoose.model('User');
userRouter.use(express.static('./public/uploads'));


module.exports.controller_1 = function(app){

//--------------------------------------------------useing for to send put req to backend from frontend-------------------------
  userRouter.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  }));
//----------------------------------allproduct--------------------------------------

userRouter.get('/allproduct',function(req,res){
  userModel.find({},function(err,product){
    if(err){
      res.send(err);
    }else{
      //res.render('dashboard',{product:product});
     res.send(product);
    }
  });//end userModel find
});
//  view product


//--------------------------frontend all product-------------------------------

  userRouter.get('/dashboard',auth.checkLogin,function(req,res){
    userModel.find({},function(err,product){
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

      }else{
        userModel.count({},function(err,count){
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

          }else{
              res.render(
                'dashboard',{
                    user:req.session.user,
                    cart:req.session.cart,
                    product:product,
                    count:count

                });
          }
        });//usermodel
      }//else
    });//end userModel find
  });//end get all product


//------------------------------View Single Product-----------------------------------------------
userRouter.get('/one/:id/single',function(req,res){
  userModel.findById({"_id":req.params.id},function(err,product){
    if(err){
      res.send(err);
    }else{

        res.send(product);
    }
  });//end userModel find
});

userRouter.get('/singleProduct/:id/one',auth.checkLogin,function(req,res){

  userModel.findOne({"_id":req.params.id},function(err,product){
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

    }else if(product == undefined || product == null || product == ""){

      res.render('singleProduct',
      {

        product:null,
        user:req.session.user,
        cart:req.session.cart
      });
  }else{
    res.render('singleProduct',
        {

          product:product,
          user:req.session.user,
          cart:req.session.cart
        });
    }

  });//end userModel find
});//end get all product
//------------------------------create product----------------------------
userRouter.post('/createProduct',auth.checkLogin,function(req,res){
  res.render('/addProduct',{
      user:req.session.user,
      cart:req.session.cart
  });
});
//---------------------------------adding multer to store images----------------------------------
  var upload = multer({storage: multer.diskStorage({

  destination: function (req, file, callback)
  { callback(null, './public/uploads');},
  filename: function (req, file, callback)
  { callback(null, file.fieldname +'-'+Date.now()+path.extname(file.originalname));}

}),

fileFilter: function(req, file, callback) {
  var ext = path.extname(file.originalname)
  if (ext !== '.PNG' && ext !== '.png' && ext !== '.jpg' && ext !== '.JPG'  && ext !== '.gif' && ext !== '.GIF' && ext !== '.jpeg' && ext !== '.JPEG') {
    return callback(/*res.end('Only images are allowed')*/ null, false)
  }
  callback(null, true)
}
});
userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({ extended: false }));
userRouter.use(express.static(__dirname + '/public'));

//add product------------------------------------------------------
  userRouter.post('/users/addProduct', upload.any(),function(req,res){
    console.log(req.body);
    console.log(req.files);
    if(!req.body && !req.files){
    res.json({success: false});
        }else{
          var c;
            userModel.findOne({},function(err,product){
              console.log("into detail");

              if (product) {
                console.log("if");
                c = product.id + 1;
              }else{
                c=1;
              }
        var newProduct =new userModel({
        id                 :   c,
        pName              :   req.body.pName,
        pCategory          :   req.body.pCategory,
        pIdeal             :   req.body.pIdeal,
        pPrice             :   req.body.pPrice,
        pOPrice            :   req.body.pOPrice,
        pDiscount          :   req.body.pDiscount,
        pDescription       :   req.body.pDescription,
        pQuantity          :   req.body.pQuantity,
        pBrand             :   req.body.pBrand,
        pSize              :   req.body.pSize,
        image1             :   req.files[0].filename

      }); //end new product
      newProduct.save(function(err,addProductone){
        if(err){
          console.log("error");
          var myResponse = responseGenerator.generate(true,err,500,null);
        //  res.render(myResponse);
            res.render('error',{
                message:myResponse.message,
                error:myResponse.data,
                cart:req.session.cart,
                user:req.session.user
              });
        }else{
              console.log("success");
                res.redirect('/dashboard');
        }//else end
      });
    })// end new user save
     }//else
});//userRouter
//---------------------------------------view to edit Product------------------------------------------
userRouter.get('/product/:id/Edit',auth.checkLogin,function(req,res){
  userModel.findById({"_id":req.params.id},function(err,oneproduct){
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
      res.render(myResponse);
    }else if(oneproduct == undefined || oneproduct == null || oneproduct == ""){

      res.render('editProduct',
      {
        title:"One product",
        product:null,
        user:req.session.user,
        cart:req.session.cart
      });

  }else{
    res.render('editProduct',
        {
          title:"One product",
          product:oneproduct,
          user:req.session.user,
          cart:req.session.cart
        });
    }

  });//end userModel find
});//router close
//---------------------trial------------------------------
userRouter.put('/p/:id/u',function(req, res){

  var update=req.body;
  userModel.findOneAndUpdate({'_id':req.params.id},update,function(err,result){
    if(err){
      res.send('ID Not Found');
    }else{

      res.send(result);
    }

  });
});
//-----------------edit and save--------------
userRouter.put('/product/:id', upload.any(),function(req,res){
  var update = req.body;
  userModel.findOneAndUpdate({'_id':req.params.id},update,function(err,editproduct){
    if(err){
      console.log(err);
      res.render('error',
                    {

                      message:"Something went wrong during product update process.",

                      error:err,
                      user:req.session.user,
                      cart:req.session.cart
                    });
    }else if(editproduct===undefined || editproduct === null || editproduct ===""){

      res.render('error',
                    {

                      message:"Something went wrong during product update process.",

                      error:err,
                      user:req.session.user,
                      cart:req.session.cart
                    });
  }else{

          console.log("success");
          userModel.findOne({'_id':req.params.id},function(err,edited){
            res.render('singleProduct',{
              user:req.session.user,
              cart:req.session.cart,
              product:edited
            });
          });


  }//else

  });//end userModel find
});//edit product

//--------------------------------delete product-------------------------
app.post('/product/:id/delete',function(req, res){

  userModel.remove({'_id':req.params.id},function(err, result){
    if(err){
      res.send('ID Not Found');
    }else{
      res.send(result);
    }
  });
});
//---------------------------------
userRouter.get('/product/:id/delete',function(req,res){
  userModel.remove({'_id':req.params.id},function(err,allproduct){
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
    }else if(allproduct===undefined || allproduct === null || allproduct ==""){

      var myResponse = responseGenerator.generate(true,err,500,null);
    //  res.render(myResponse);
        res.render('error',{
            message:myResponse.message,
            error:myResponse.data,
            user:req.session.user,
            cart:req.session.cart
          });
  }else{
    userModel.count({},function(err,count){
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
      }else{
          console.log("product deleted Successfully");

            res.redirect('/dashboard');
      }//else close
    });//end usermodel

  }//else

  });//end userModel find
});//delete product

  app.use('/', userRouter);
}
