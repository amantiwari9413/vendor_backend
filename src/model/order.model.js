import mongoose from "mongoose";
import { Schema } from "mongoose";

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    vendor: {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
        required: true
    },
    items: [{
        item: {
            type: Schema.Types.ObjectId,
            ref: "Items",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    deliveryPerson: {
        type: Schema.Types.ObjectId,
        ref: "User", // Assuming delivery persons are also stored in User collection
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'ready', 'picked_up', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi'],
        required: true
    },
    estimatedDeliveryTime: {
        type: Date
    },
}, {
    timestamps: true
});

export const Order = mongoose.model('Order', orderSchema); 




