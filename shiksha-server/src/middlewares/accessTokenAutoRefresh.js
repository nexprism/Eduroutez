import { Token } from "../utils/index.js";

const accessTokenAutoRefresh = async (req, res, next) => {
  try {
    // Read access token from cookies or custom header `X-Access-Token`
    const accessToken = req.cookies.accessToken || JSON.parse(req.headers["x-access-token"]);

    // If access token exists and is not expired, set it in the Authorization header
    if (accessToken && !Token.isTokenExpired(accessToken)) {
      req.headers["authorization"] = `Bearer ${accessToken}`;
    }

    // If access token is missing or expired, try to refresh it
    if (!accessToken || Token.isTokenExpired(accessToken)) {
      // Read refresh token from cookies or custom header `X-Refresh-Token`
      const refreshToken = req.cookies.refreshToken || JSON.parse(req.headers["x-refresh-token"]);
      if (!refreshToken) {
        // If refresh token is also missing, return an unauthorized response
        return res.status(401).json({
          error: "Unauthorized",
          message: "Access and refresh tokens are missing or invalid",
        });
      }

      // Refresh the access token using the refresh token
      const { newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp } = await Token.refreshAccessToken(req, res);

      // Set the new access and refresh tokens as HTTP-only cookies
      Token.setTokensCookies(res, newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp);

      // Set the new access token in the Authorization header
      req.headers["authorization"] = `Bearer ${newAccessToken}`;
    }

    next(); // Proceed to the next middleware
  } catch (error) {
    // Log error and send a response if something goes wrong
    console.error("Error refreshing access token:", error);
    res.status(401).json({
      error: "Unauthorized",
      message: "Failed to refresh access token or token is invalid",
    });
  }
};

export default accessTokenAutoRefresh;
