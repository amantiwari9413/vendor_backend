import mongoose, { Schema } from "mongoose";
const categorySchema=Schema({
    categoryName:{
        required:true,
        type:String
    },
    vendorId:{
            required:true,
            type:Schema.Types.ObjectId,
            ref:"Vendor"
    },
})
export const Category= mongoose.model('Category',categorySchema);

