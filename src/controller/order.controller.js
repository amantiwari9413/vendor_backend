import { Order } from '../model/order.model.js';
import asyncHandler from "../utills/asyncHandler.js"
import {Item} from "../model/item.model.js"

// Create a new order
export const createOrder = asyncHandler(async (req, res) => {
    const { user, vendor, items, deliveryAddress, paymentMethod } = req.body;
    if (!user || !vendor || !items || !deliveryAddress || !paymentMethod) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required'
        });
    }

    // Check if items array is empty
    if (items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Order must contain at least one item'
        });
    }

    // Validate each item in the items array
    for (const item of items) {
        if (!item.item || !item.quantity) {
            return res.status(400).json({
                success: false,
                message: 'Each item must have an item ID and quantity'
            });
        }
    }
    
    // First check if all items exist
    for (const item of items) {
        const itemData = await Item.findById(item.item);
        if (!itemData) {
            return res.status(404).json({
                success: false,
                message: `Item with id ${item.item} not found`
            });
        }
    }

    // Calculate total amount by waiting for all price calculations
    let totalAmount = 0;
    const itemsData = await Promise.all(items.map(async (item) => {
        const itemData = await Item.findById(item.item);
        return {
            price: Number(itemData.itemPrice),
            quantity: Number(item.quantity)
        };
    }));
    
    // Calculate total after all async operations are complete
    itemsData.forEach(item => {
        totalAmount += item.price * item.quantity;
    });
    
    const order = new Order({
        user,
        vendor,
        items,
        deliveryAddress,
        paymentMethod,
        totalAmount,
        status: 'pending'
    });
    
    await order.save();
    
    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
    });
});
// Get all orders
export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate('user', 'name email')
        .populate('vendor', 'name email')
        .populate('items.item', 'name price')
        .populate('deliveryPerson', 'name email');

    res.status(200).json({
        success: true,
        data: orders
    });
});

// // Get orders by user
export const getOrdersByUser = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.query.userId })
    .populate('items.item', 'itemName itemPrice itemImg')
    .populate('vendor', 'name phone')
    // Format the response with only the required fields
    const formattedOrders = orders.map(order => {
        const formattedItems = order.items.map(item => ({
            itemName: item.item.itemName,
            itemPrice: item.item.itemPrice,
            quantity: item.quantity,
            itemImg: item.item.itemImg
        }));

        return {
            _id: order._id,
            items: formattedItems,
            status: order.status,
            totalPrice: order.totalAmount,
            vendorName: order.vendor.name,
            vendorPhone: order.vendor.phone,
            estimatedDeliveryTime: order.estimatedDeliveryTime || new Date(Date.now() + 30 * 60000)
        };
    });

    res.status(200).json({
        success: true,
        data: formattedOrders
    });
});
//Get all orders by vendor
export const getOrdersByVendor = asyncHandler(async (req, res) => {
    const orders = await Order.find({ vendor: req.query.vendorId })
        .populate('items.item', 'itemName itemPrice itemImg')
        .populate('user', 'userName phoneNumber');

    // Format the response with only the required fields
    const formattedOrders = orders.map(order => {
        const formattedItems = order.items.map(item => ({
            itemName: item.item.itemName,
            itemPrice: item.item.itemPrice,
            quantity: item.quantity,
            itemImg: item.item.itemImg
        }));

        return {
            _id: order._id,
            items: formattedItems,
            status: order.status,
            totalPrice: order.totalAmount,
            userName: order.user.userName,
            userPhone: order.user.phoneNumber,
            estimatedDeliveryTime: order.estimatedDeliveryTime || new Date(Date.now() + 30 * 60000)
        };
    });

    res.status(200).json({
        success: true,
        data: formattedOrders
    });
});
// Cancel order
export const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId, userId } = req.body;
    
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    // Check if the userId matches either the order's user or vendor
    if (order.user.toString() !== userId && order.vendor.toString() !== userId) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to cancel this order'
        });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
        return res.status(400).json({
            success: false,
            message: 'Cannot cancel this order'
        });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
    });
});
//Update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId, status } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }
    if (order.status === 'cancelled') {
        return res.status(400).json({
            success: false,
            message: 'Order is already cancelled'
        });
    }
    order.status = status;
    await order.save();

    res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
    });
});
//Get order for delivery person
export const getOrdersForDelivery = asyncHandler(async (req, res) => {
    // Find all orders with status 'ready' and no assigned delivery person
    const readyOrders = await Order.find({
        status: 'ready',
        deliveryPerson: null
    })
    .populate('user', 'userName phoneNumber')
    .populate('vendor', 'name phone')
    .populate('items.item', 'itemName itemPrice itemImg');

    if (!readyOrders || readyOrders.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'No orders available for delivery'
        });
    }

    // Format the response data
    const formattedOrders = readyOrders.map(order => ({
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

    res.status(200).json({
        success: true,
        message: 'Orders available for delivery retrieved successfully',
        data: formattedOrders
    });
});




