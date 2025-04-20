import ApiError from "./apiError.js";

const generateAccessTokenAndRefereshToken = async function(User) {
    try {
        const accessToken = User.generateAccessToken();
        const refreshToken = User.generateRefreshToken();
        User.refreshToken = refreshToken;
        await User.save({ validateBeforeSave: false });
        
        const UserData = {
            user_id: User._id,
            name: User.userName || User.name, // Handle both user and vendor
            contact: User.phoneNumber || User.phone // Handle both user and vendor
        };
        return { accessToken, refreshToken, UserData };
        
    } catch (error) {
        throw new ApiError(400, error.message);
    }
};      

export { generateAccessTokenAndRefereshToken };