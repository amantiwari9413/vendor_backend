import mongoose from "mongoose";
import { Schema } from "mongoose";
const vendorSchema = Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    email: { 
        type: String, 
        required: true, 
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Password must be at least 8 characters long']
    },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },

},
{
    timestamps: true
});



export const Vendor = mongoose.model('Vendor', vendorSchema);