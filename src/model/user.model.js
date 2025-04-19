import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    userEmail: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    password: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    refreshToken:{type:String},
}, { timestamps: true });

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10);
    next();
})
  
  userSchema.methods.isPasswordCorrect= async function (password) {
  return await bcrypt.compare(password,this.password)
  }
  
  
  userSchema.methods.generateAccessToken=function(){
  return jwt.sign({
    _id:this._id,
    userName:this.userName,
    phoneNumber:this.phoneNumber,
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
  }
  )
  }
  
  userSchema.methods.generateRefreshToken=function(){
  return jwt.sign({
    _id:this._id,
    userName:this.userName,
    phoneNumber:this.phoneNumber,
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
  }
  )
  }
  
  const User = mongoose.model('User', userSchema);
  export default User;
