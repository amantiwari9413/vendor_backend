import asyncHandler from "../utills/asyncHandler.js"
import { Order } from "../model/order.model.js"
import apiResponse from "../utills/apiResponse.js"
import apiError from "../utills/apiError.js"

export const assignDeliveryPerson = asyncHandler(async (req, res) => {
    const { orderId, userId } = req.body;

    if (!orderId || !userId) {
        throw new apiError(400, "Order ID and User ID are required");
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
        throw new apiError(404, "Order not found");
    }

    // Check if order is in ready state
    if (order.status !== 'ready') {
        throw new apiError(400, "Order is not ready for delivery assignment");
    }

    // Check if delivery person is already assigned
    if (order.deliveryPerson) {
        throw new apiError(400, "Delivery person is already assigned to this order");
    }

    // Update delivery person and status
    order.deliveryPerson = userId;
    await order.save();

    return res.status(200).json(
        new apiResponse(
            200,
            order,
            "Delivery person assigned successfully"
        )
    );
});

//Get all orders for delivery person
export const getOrdersForDelivery = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        throw new apiError(400, "User ID is required");
    }

    // Find orders assigned to the delivery person
    const orders = await Order.find({ deliveryPerson: userId })
        .populate('user', 'userName phoneNumber')
        .populate('vendor', 'name phone')
        .populate('items.item', 'itemName itemPrice itemImg');

    if (!orders || orders.length === 0) {
        throw new apiError(404, "No orders found for the delivery person");
    }   

    // Format the response data
    const formattedOrders = orders.map(order => ({
        orderId: order._id,
        userName: order.user.userName,
        phoneNumber: order.user.phoneNumber,    
        deliveryAddress: order.deliveryAddress,
        vendorName: order.vendor.name,
        vendorPhone: order.vendor.phone,
        items: order.items.map(item => ({
            itemName: item.item.itemName,
            itemPrice: item.item.itemPrice, 
            itemImg: item.item.itemImg,
            quantity: item.quantity
        })),
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod
    }));

    return res.status(200).json(
        new apiResponse(
            200,
            formattedOrders,
            "Orders retrieved successfully"
        )
    );
});

// Get total amount collected by delivery person for a specific day
export const getDeliveryPersonCollection = asyncHandler(async (req, res) => {
    const { userId, date } = req.body;

    if (!userId) {
        throw new apiError(400, "User ID is required");
    }

    // Create start and end date for the specified date
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    // Find completed orders for the delivery person within the date range
    const orders = await Order.find({
        deliveryPerson: userId,
        status: 'delivered',
        updatedAt: {
            $gte: startDate,
            $lte: endDate
        }
    });

    // Calculate total collection amount
    const totalCollection = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get count of cash, card and UPI payments
    const paymentBreakdown = {
        cash: orders.filter(order => order.paymentMethod === 'cash').length,
        card: orders.filter(order => order.paymentMethod === 'card').length,
        upi: orders.filter(order => order.paymentMethod === 'upi').length
    };

    return res.status(200).json(
        new apiResponse(
            200,
            {
                totalCollection,
                totalOrders: orders.length,
                paymentBreakdown,
                date: startDate.toISOString().split('T')[0]
            },
            "Collection details retrieved successfully"
        )
    );
}); 

        
