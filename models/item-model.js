var mongoose =require('mongoose');
var Schema = mongoose.Schema ;
 var itemSchema = new Schema({
        type:{
                type: String,
                required: true,
         },

         name:{
             unique: true,
             type: String,
             required: true,

         },
         description:{
             type: String,
             required: true,

    },
       quantity:{
           type:Number,
           default: 1

       },
       price:{
        type:Number,
        default: 0
       }
 })
    var Item = mongoose.model('Item',itemSchema);
    module.exports = Item;