import {mongoose,Schema} from "mongoose";

const itemSchema=Schema({
    itemName:{
        required:true,
        type:String
    },
    itemPrice:{
        required:true,
        type:String
    },
    itemImg:{
        required:true,
        type:String
    },
    categoryId:{
        required:true,
        type:Schema.Types.ObjectId,
        ref:"Category"
    },
    vendorId:{
        required:true,
        type:Schema.Types.ObjectId,
        ref:"Vendor"
}
})
export const Item= mongoose.model('Items',itemSchema);
