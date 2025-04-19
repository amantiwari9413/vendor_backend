import asyncHandler from "../utills/asyncHandler.js"
import apiError from "../utills/apiError.js"
import User from "../model/user.model.js"
import apiResponse from "../utills/apiResponse.js";
import { generateAccessTokenAndRefereshToken } from "../utills/token.utills.js";
import bcrypt from "bcryptjs";
const registerUser = asyncHandler(async (req, res, next) => {
   const { 
      userName,
      userEmail,
      phoneNumber,
      password,
      location
   } = req.body;

   // Check if all required fields are provided
   if (
      !userName?.trim() ||
      !userEmail?.trim() ||
      !phoneNumber?.trim() ||
      !password?.trim() ||
      !location?.trim()
   ) {
      throw new apiError(400, "All fields are required");
   }

   // Validate email format
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailRegex.test(userEmail)) {
      throw new apiError(400, "Invalid email format");
   }

   // Validate phone number
   const phoneRegex = /^[0-9]{10}$/; // Assumes 10-digit phone number
   if (!phoneRegex.test(phoneNumber)) {
      throw new apiError(400, "Invalid phone number format. Please enter a 10-digit number");
   }
   
   // Check if user already exists by phone number
   const findUserByPhone = await User.findOne({ phoneNumber }, { phoneNumber: 1 });
   if (findUserByPhone) {
      throw new apiError(409, "User with this phone number already exists"); // 409 Conflict for existing resource
   }
   

   // Create user
   const tempUser = await User.create({
      userName,
      userEmail,
      phoneNumber,
      password,
      location
   });

   // Verify user creation
   const newUser = await User.findById(tempUser._id);

   if (!newUser) {
      throw new apiError(500, "Error while creating user!"); // 500 for server error
   }

   // Return success response
   return res.status(201).json(
      new apiResponse(201, newUser, "User registered successfully")
   );
});

const loginUser = asyncHandler(async (req, res, next) => {
   const { phoneNumber, password } = req.body;
   // Check if all required fields are provided
   if (!phoneNumber?.trim() || !password?.trim()) {
      throw new apiError(400, "All fields are required");
   }

   // Validate phone number
   const phoneRegex = /^[0-9]{10}$/;
   if (!phoneRegex.test(phoneNumber)) {
      throw new apiError(400, "Invalid phone number format. Please enter a 10-digit number");
   }

   // Check if user exists
   const user = await User.findOne({ phoneNumber });

   if (!user) {
      throw new apiError(404, "User not found");
   }

   // Check password
   const isPasswordValid = await bcrypt.compare(password, user.password);  

   if (!isPasswordValid) {
      throw new apiError(401, "Invalid password");
   }

   // Generate access token and refresh token
   const { accessToken, refreshToken, UserData } = await generateAccessTokenAndRefereshToken(user);

   const options = {
      httpOnly: true,
      secure:true
   }
   return res.status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new apiResponse(200,{
         accessToken,
         refreshToken,
         UserData
      }, 
      "User logged in successfully")
   )


})

const logoutUser = asyncHandler(async (req, res, next) => {
   await User.findByIdAndUpdate(
      req.user._id,
      {
          $set:{
              refreshToken:undefined 
          }
      },
      {
          new:true
      }
  )
  const options={
      httpOnly:true,
      secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken", options)
  .json(new apiResponse(200,{},"User logged Out"))
})




export { registerUser, loginUser, logoutUser };