import asyncHandler from "../utills/asyncHandler.js"
import apiError from "../utills/apiError.js"
import apiResponse from "../utills/apiResponse.js"
import { Vendor } from "../model/vendor.model.js";
import { Category } from "../model/category.model.js";

const addCategory = asyncHandler(async (req, res) => {
    const { categoryName, vendorId } = req.body;

    if (!categoryName || !vendorId) {
        throw new apiError(400, "Category name and vendor ID are required");
    }

    if (categoryName.trim() === "") {
        throw new apiError(400, "Category name cannot be empty");
    }

    // Validate vendorId format
    if (!vendorId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new apiError(400, "Invalid vendor ID format");
    }

    // Check if the vendorId exists
    const vendorExists = await Vendor.findById(vendorId);
    if (!vendorExists) {
        throw new apiError(404, "Vendor not found");
    }
    const newCategory = await Category.create({
        categoryName: categoryName.trim().toUpperCase(),
        vendorId: vendorId,
    });
    return res.status(201).json(new apiResponse(201, newCategory, "Category added successfully"));
});

const deleteCategory = asyncHandler(async (req, res) => {   
    const { categoryId } = req.body;
    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    return res.status(200).json(new apiResponse(200, deletedCategory, "Category deleted successfully"));
});


const getCategoryByVendorId = asyncHandler(async (req, res) => {
    const { vendorId } = req.query;
    const category = await Category.find({ vendorId: vendorId });
    if (!category) {
        throw new apiError(404, "Category not found");
    }
    return res.status(200).json(new apiResponse(200,category, "Category fetched successfully"));
    
});

const getAllUniqueCategories = asyncHandler(async (req, res) => {
    // Find all categories and select only categoryName field
    const categories = await Category.distinct("categoryName");

    if (!categories || categories.length === 0) {
        throw new apiError(404, "No categories found");
    }

    return res.status(200).json(
        new apiResponse(
            200,
            categories,
            "All unique category names fetched successfully"
        )
    );
});


export {
    addCategory,
    deleteCategory,
    getCategoryByVendorId,
    getAllUniqueCategories
}