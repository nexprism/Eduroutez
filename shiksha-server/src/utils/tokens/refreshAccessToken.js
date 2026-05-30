import User from "../../models/User.js";
import UserRefreshToken from "../../models/UserRefreshToken.js";
import { generateTokens } from "./generateTokens.js";
import { verifyRefreshToken } from "./verifyToken.js";

const refreshAccessToken = async (oldRefreshToken) => {
  try {
    if (!oldRefreshToken) {
      throw new Error("Refresh token missing");
    }

    // Verify Refresh Token - note: verifyRefreshToken throws on error
    const { tokenDetails } = await verifyRefreshToken(oldRefreshToken);

    // Find User based on Refresh Token detail id
    const user = await User.findById(tokenDetails._id);
    if (!user) {
      throw new Error("User not found");
    }

    const userRefreshToken = await UserRefreshToken.findOne({ userId: tokenDetails._id });
    if (!userRefreshToken || oldRefreshToken !== userRefreshToken.token || userRefreshToken.blacklisted) {
      throw new Error("Unauthorized access or token blacklisted");
    }

    // Generate new access and refresh tokens
    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } = await generateTokens(user);

    return {
      newAccessToken: accessToken,
      newRefreshToken: refreshToken,
      newAccessTokenExp: accessTokenExp,
      newRefreshTokenExp: refreshTokenExp,
    };
  } catch (error) {
    // Re-throw the error to be handled by the middleware
    throw error;
  }
};

export { refreshAccessToken };
