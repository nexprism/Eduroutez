import jwt from "jsonwebtoken";
import UserRefreshToken from "../../models/UserRefreshToken.js";
import { ServerConfig } from "../../config/index.js";

const generateTokens = async (user) => {
  try {
    const payload = { _id: user._id, roles: user.role };
    console.log('payload',payload)

    // Generate access token with expiration time
    const accessTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5; // Set expiration to 100 seconds from now
    // const accessTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5; // Set expiration to 100 seconds from now
    const accessToken = jwt.sign(
      { ...payload, exp: accessTokenExp },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY
      // { expiresIn: '10s' }
    );

    // Generate refresh token with expiration time
    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // Set expiration to 5 days from now
    // const refreshTokenExp = Math.floor(Date.now() / 1000) + 15; // Set expiration to 5 days from now
    const refreshToken = jwt.sign(
      { ...payload, exp: refreshTokenExp },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY
      // { expiresIn: '5d' }
    );

    await UserRefreshToken.findOneAndDelete({ userId: user._id });

    // Save New Refresh Token
    await new UserRefreshToken({ userId: user._id, token: refreshToken }).save();

    return Promise.resolve({ accessToken, refreshToken, accessTokenExp, refreshTokenExp });
  } catch (error) {
    return Promise.reject(error);
  }
};

const generateTokenForResetPassword = async (user) => {
  try {
    const payload = { _id: user._id, roles: user.roles };
    const secret = ServerConfig.JWT_EMAIL_RESET_SECRET;
    const token = jwt.sign({ userID: user._id }, secret, { expiresIn: "15m" });
    return token;
  } catch (error) {
    return Promise.reject(error);
  }
};

export { generateTokens, generateTokenForResetPassword };
