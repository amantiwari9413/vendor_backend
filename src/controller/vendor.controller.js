import { Vendor } from '../model/vendor.model.js';
import apiError  from '../utills/apiError.js';
import  apiResponse  from '../utills/apiResponse.js';
import  asyncHandler  from '../utills/asyncHandler.js';
import {generateAccessTokenAndRefereshToken} from '../utills/token.utills.js';

const registerVendor = asyncHandler(async (req, res, next) => {
    const {
        name,
        address,
        phone,
        email,
        password
    } = req.body;

    // Check if all required fields are provided
    if (
        !name?.trim() ||
        !phone?.trim() ||
        !email?.trim() ||
        !password?.trim() ||
        !address?.trim()
    ) {
        return res.status(400).json(
            new apiResponse(400, null, "All fields are required")
        );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json(
            new apiResponse(400, null, "Invalid email format")
        );
    }

    // Validate phone number
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json(
            new apiResponse(400, null, "Invalid phone number format")
        );
    }

    // Validate password strength
    if (password.length < 8) {
        return res.status(400).json(
            new apiResponse(400, null, "Password must be at least 8 characters long")
        );
    }

    // Check if restaurant already exists by phone number
    const findVendorByPhone = await Vendor.findOne({ phone });
    if (findVendorByPhone) {
        return res.status(409).json(
            new apiResponse(409, null, "Vendor with this phone number already exists")
        );
    }

    // Check if restaurant already exists by email
    const findVendorByEmail = await Vendor.findOne({ email });
    if (findVendorByEmail) {
        return res.status(409).json(
            new apiResponse(409, null, "Vendor with this email already exists")
        );
    }

    // Create restaurant
    const newVendor = await Vendor.create({
        name,
        address,
        phone,
        email,
        password
    });

    // Verify restaurant creation
    const createdVendor = await Vendor.findById(newVendor._id).select('-password');

    if (!createdVendor) {
        return res.status(500).json(
            new apiResponse(500, null, "Error while creating vendor")
        );
    }

    // Return success response
    return res.status(201).json(
        new apiResponse(201, createdVendor, "Vendor registered successfully")
    );
});

const getAllVendor = asyncHandler(async (req, res, next) => {
    const vendors = await Vendor.find();
    return res.status(200).json(new apiResponse(200, vendors, "Vendors fetched successfully"));
});

const loginVendor = asyncHandler(async (req, res, next) => {
    const { phone, password } = req.body;
    // Check if phone and password are provided
    if (!phone?.trim() || !password?.trim()) {
        return res.status(400).json(
            new apiResponse(400, null, "Phone number and password are required")
        );
    }

    // Check if vendor exists by phone number
    const vendor = await Vendor.findOne({ phone });
    if (!vendor) {
        return res.status(404).json(
            new apiResponse(404, null, "Vendor not found")
        );
    }

    // Check if password is correct
    const isPasswordCorrect = await vendor.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        return res.status(401).json(
            new apiResponse(401, null, "Invalid password")
        );
    }

    // Generate access token and refresh token
    const {accessToken,refreshToken,UserData} = await generateAccessTokenAndRefereshToken(vendor);

    // Return success response
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
        "Vendor logged in successfully")
     )
});

const logoutVendor = asyncHandler(async (req, res, next) => {
   await Vendor.findByIdAndUpdate(
      req.vendor._id,
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
  .json(new apiResponse(200,{},"Vendor logged Out"))
})






export { registerVendor, getAllVendor, loginVendor, logoutVendor };