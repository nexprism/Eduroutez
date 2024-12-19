import jwt from "jsonwebtoken";
import UserRefreshToken from "../../models/UserRefreshToken.js";
import { ServerConfig } from "../../config/index.js";
const verifyRefreshToken = async (refreshToken) => {
  try {
    const privateKey = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;

    // Find the refresh token document
    const userRefreshToken = await UserRefreshToken.findOne({ token: refreshToken });

    // If refresh token not found, reject with an error
    if (!userRefreshToken) {
      throw { error: true, message: "Invalid refresh token" };
    }

    // Verify the refresh token
    const tokenDetails = jwt.verify(refreshToken, privateKey);

    // If verification successful, resolve with token details
    return {
      tokenDetails,
      error: false,
      message: "Valid refresh token",
    };
  } catch (error) {
    // If any error occurs during verification or token not found, reject with an error
    throw { error: true, message: "Invalid refresh token" };
  }
};

const verifyResetToken = (token) => {
  try {
    const privateKey = ServerConfig.JWT_EMAIL_RESET_SECRET;
    return jwt.verify(token, privateKey);
  } catch (error) {
    throw { error: true, message: "Invalid access token" };
  }
};

export { verifyRefreshToken, verifyResetToken };
