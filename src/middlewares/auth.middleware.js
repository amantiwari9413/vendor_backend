import asyncHandler from "../utills/asyncHandler.js"
import ApiError from "../utills/apiError.js"
import jwt from "jsonwebtoken"
import User from "../model/user.model.js"
import { Vendor } from "../model/vendor.model.js"
export const verifyJWT=asyncHandler(async (req,res,next)=>{
try {
        const token=req.cookies?.accessToken || 
        req.header("Authorization")?.replace("Bearer","");
        if(!token){
            throw new ApiError(401, "Unauthorized token")
        };
        const decodedInfo=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await User.findById(decodedInfo?._id).
        select("-password -refreshToken");
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user=user;
        next();
} catch (error) {
    throw new ApiError(401,error.message)
}
})

export const verifyVendorJWT=asyncHandler(async (req,res,next)=>{
    try {
        const token=req.cookies?.accessToken || 
        req.header("Authorization")?.replace("Bearer","");
        if(!token){
            throw new ApiError(401, "Unauthorized token")
        };
        const decodedInfo=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const vendor=await Vendor.findById(decodedInfo?._id).
        select("-password -refreshToken");
        if(!vendor){
            throw new ApiError(401, "Invalid Access Token")
        };
        req.vendor=vendor;
        next();
    } catch (error) {
        throw new ApiError(401,error.message)
    }
})
