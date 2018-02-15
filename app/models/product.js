//defining mongoose Schema
//including module
var mongoose = require('mongoose');
//declare schema object
var Schema =mongoose.Schema;
var productSchema= new Schema({
  pId                :   {type:Number,id:true},
  pName              :   {type:String, default:'',required:true},
  pCategory          :   {type:String, deafult:'',required:true},
  pIdeal             :   {type:String, default:'',required:true},
  pPrice             :   {type:Number, default:'',required:true},
  pOPrice            :   {type:Number, default:'',required:true},
  pDiscount          :   {type:Number, default:'',required:true},
  pDescription       :   {type:String, default:''},
  pQuantity          :   {type:Number, default:''},
  pBrand             :   {type:String, default:'',required:true},
  pSize              :   {type:String, default:'',required:true},
  image1             :   {data:Buffer, type:String}



});


mongoose.model('Product',productSchema);