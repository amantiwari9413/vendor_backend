import { Vendor } from '../model/vendor.model.js';
import apiError  from '../utills/apiError.js';
import  apiResponse  from '../utills/apiResponse.js';
import  asyncHandler  from '../utills/asyncHandler.js';


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
        !password?.trim()
    ) {
        throw new apiError(400, "All fields are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new apiError(400, "Invalid email format");
    }

    // Validate phone number
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) {
        throw new apiError(400, "Invalid phone number format");
    }

    // Validate password strength
    if (password.length < 8) {
        throw new apiError(400, "Password must be at least 8 characters long");
    }

    // Check if restaurant already exists by phone number
    const findVendorByPhone = await Vendor.findOne({ phone });
    if (findVendorByPhone) {
        throw new apiError(409, "Vendor with this phone number already exists");
    }

    // Check if restaurant already exists by email
    const findVendorByEmail = await Vendor.findOne({ email });
    if (findVendorByEmail) {
        throw new apiError(409, "Vendor with this email already exists");
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
        throw new apiError(500, "Error while creating vendor");
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

export { registerVendor, getAllVendor };