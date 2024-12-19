import User from "../../models/User.js";
import UserRefreshToken from "../../models/UserRefreshToken.js";

import { generateTokens } from "./generateTokens.js";
import { verifyRefreshToken } from "./verifyToken.js";

const refreshAccessToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken || req.headers["x-refresh-token"];
    // Verify Refresh Token is valid or not
    const { tokenDetails, error } = await verifyRefreshToken(oldRefreshToken);

    if (error) {
      return res.status(401).send({ status: "failed", message: "Invalid refresh token" });
    }
    // Find User based on Refresh Token detail id
    const user = await User.findById(tokenDetails._id);

    if (!user) {
      return res.status(404).send({ status: "failed", message: "User not found" });
    }

    const userRefreshToken = await UserRefreshToken.findOne({ userId: tokenDetails._id });

    if (oldRefreshToken !== userRefreshToken.token || userRefreshToken.blacklisted) {
      return res.status(401).send({ status: "failed", message: "Unauthorized access" });
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
    res.status(500).send({ status: "failed", message: "Internal server error" });
  }
};

export { refreshAccessToken };
