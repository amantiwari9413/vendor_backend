import asyncHandler from "../utills/asyncHandler.js"
import apiError from "../utills/apiError.js"
import apiResponse from "../utills/apiResponse.js"
import { Item } from "../model/item.model.js"
import { Category } from "../model/category.model.js"
import { Vendor } from "../model/vendor.model.js"
import { uploadeOnCloudinary } from "../utills/cloudinary.js"


const addItem=asyncHandler(async(req,res)=>{
    const {itemName,itemPrice,itemImg,categoryId,vendorId}=req.body;

    if(itemName.trim() === "" && itemPrice.trim() === "" && itemImg.trim === "" && categoryId.trim() === "" && vendorId.trim() === ""){
        throw new apiError(400,"all filds is required")
    };

    const tempCategory = await Category.findOne({
        _id:categoryId
    });

    const tempVendor = await Vendor.findOne({
        _id:vendorId
    });
    
    if (!tempCategory) {
        throw new apiError(204,"Category not found")
    };

    if (!tempVendor) {
        throw new apiError(204,"Vendor not found")
    };

    // coloudinary part
    if(!req.file){
        throw new apiError(400,"Item image is required")
    }
    const imgUrl= await uploadeOnCloudinary(req.file.path)
    const name =itemName.trim().toUpperCase()
    const tempitem=await Item.create({
        itemName:name,
        itemPrice:itemPrice,
        itemImg:imgUrl.secure_url,
        categoryId:tempCategory._id,
        vendorId:tempVendor._id
    });

    const addItem= await Item.findById(tempitem._id)
    if(!addItem){
        throw new apiError(500,"Error creating item")
    };
    return res.status(201).json(new apiResponse(200,addItem,"Item added Succesfully") );
})
const deleteItem = asyncHandler(async (req, res) => {
    const { itemId } = req.query;
    
    // Check if itemId is provided
    if (!itemId) {
        throw new apiError(400, "Please provide itemId parameter");
    }
    
    // Find and delete the item
    const deletedItem = await Item.findByIdAndDelete(itemId);
    
    if (!deletedItem) {
        throw new apiError(404, "Item not found");
    }
    
    return res.status(200).json(
        new apiResponse(200, deletedItem, "Item deleted successfully")
    );
});

const getAllItemsByVendorId = asyncHandler(async (req, res) => {
    const { vendorId } = req.query;
    
    // Check if restaurantId is provided
    if (!vendorId) {
        throw new apiError(400, "Please provide vendorId parameter");
    }
    
    // Validate restaurant exists
    const tempVendor = await Vendor.findOne({
        _id: vendorId
    });
    
    if (!tempVendor) {
        throw new apiError(204, "Vendor not found");
    }
    
    // Find all items for this restaurant
    const items = await Item.find({ vendorId })
        .populate('vendorId', { _id: 1, name: 1 });
    
    return res.status(200).json({
        statusCode: 200,
        data: items,
        message: "Items fetched successfully",
        success: true
    });
});

const getItemByCategoryName = asyncHandler(async (req, res) => {
    const { categoryName } = req.query;
    
    // Check if categoryName is provided
    if (!categoryName) {
        throw new apiError(400, "Please provide categoryName parameter");
    }
    
    // Find category by name
    const tempCategory = await Category.findOne({ 
        categoryName: categoryName.trim().toUpperCase() 
    });   
    if (!tempCategory) {
        throw new apiError(204, "Category not found");
    }
    
    // Find all items for this category
    const items = await Item.find({ categoryId: tempCategory._id })
        .populate('vendorId', { _id: 1, name: 1 });
        
    if(!items || items.length === 0){
        throw new apiError(404, "No items found for this category");
    }

    return res.status(200).json({
        statusCode: 200,
        data: items,
        message: "Items fetched successfully",
        success: true
    });
});

const getItemByName = asyncHandler(async (req, res) => {
    const { itemName } = req.query;
    
    // Check if itemName is provided
    if (!itemName) {
        throw new apiError(400, "Please provide itemName parameter");
    }
    
    // Find items by name
    const items = await Item.find({ itemName: { $regex: new RegExp(itemName, 'i') }  })
        .populate('vendorId', { _id: 1, name: 1 });    

    if(!items || items.length === 0){
        throw new apiError(404, "No items found");
    }

    return res.status(200).json({
        statusCode: 200,
        data: items,
        message: "Items fetched successfully",
        success: true
    });
});

const getAllItems = asyncHandler(async (req, res) => {
    // Find all items with vendor details
    const items = await Item.find({})
        .populate('vendorId', { _id: 1, name: 1 });
    
    if(!items || items.length === 0){
        throw new apiError(404, "No items found");
    }

    return res.status(200).json({
        statusCode: 200,
        data: items,
        message: "All items fetched successfully",
        success: true
    });
});

const getItemByCategoryId = asyncHandler(async (req, res) => {
    const { categoryId } = req.query;

    // Check if categoryId is provided
    if (!categoryId) {
        throw new apiError(400, "Please provide categoryId parameter");
    }

    // Find items by categoryId and populate vendor details
    const items = await Item.find({ categoryId })
        .populate('vendorId', { _id: 1, name: 1 });

    if (!items || items.length === 0) {
        throw new apiError(404, "No items found for this category");
    }

    return res.status(200).json({
        statusCode: 200,
        data: items,
        message: "Items fetched successfully",
        success: true
    });
});



export{
    addItem,
    getAllItemsByVendorId,
    getItemByCategoryName,
    deleteItem,
    getItemByName,
    getAllItems,
    getItemByCategoryId
}