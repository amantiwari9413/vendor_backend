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
        .populate('categoryId', 'categoryName')
        .populate('vendorId', 'vendorName');
    
    return res.status(200).json(
        new apiResponse(200, items, "Items fetched successfully")
    );
});

const getItemByCategoryName = asyncHandler(async (req, res) => {
    const { categoryName } = req.query;
    
    // Check if categoryName is provided
    if (!categoryName) {
        return res.status(400).json(
            new apiResponse(400, null, "Please provide categoryName parameter")
        );
    }
    
    // Find category by name
    const tempCategory = await Category.findOne({ 
        categoryName: categoryName.trim().toUpperCase() 
    });   
    if (!tempCategory) {
        return res.status(204).json(
            new apiResponse(204, null, "Category not found")
        );
    }
    
    // Find all items for this category
    const items = await Item.find({ categoryId: tempCategory._id })
        .populate('categoryId', 'categoryName')
        .populate('vendorId', 'name');
        
    if(!items || items.length === 0){
        return res.status(404).json(
            new apiResponse(404, null, "No items found for this category")
        );
    }

    return res.status(200).json(
        new apiResponse(200, items, "Items fetched successfully")
    );
});

const getItemByName = asyncHandler(async (req, res) => {
    const { itemName } = req.query;
    
    // Check if itemName is provided
    if (!itemName) {
        throw new apiError(400, "Please provide itemName parameter");
    }
    
    // Find items by name
    const items = await Item.find({ itemName: { $regex: new RegExp(itemName, 'i') }  })
    .populate('vendorId', 'name');    
    if(!items){
        throw new apiError(404,"No items found")
    }
    return res.status(200).json(
        new apiResponse(200, items, "Items fetched successfully")
    );
});

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

const getAllItems = asyncHandler(async (req, res) => {
    // Find all items with vendor details
    const items = await Item.find({}).populate('vendorId', 'name');
    
    if(!items || items.length === 0){
        return res.status(404).json(
            new apiResponse(404, null, "No items found")
        );
    }

    return res.status(200).json(
        new apiResponse(200, items, "All items fetched successfully")
    );
});


export{
    addItem,
    getAllItemsByVendorId,
    getItemByCategoryName,
    deleteItem,
    getItemByName,
    getAllItems
}