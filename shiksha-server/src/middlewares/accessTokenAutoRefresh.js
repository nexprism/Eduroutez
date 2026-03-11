import { Token } from "../utils/index.js";

const accessTokenAutoRefresh = async (req, res, next) => {
  try {
    console.log("accessTokenAutoRefresh middleware");
    console.log(req.headers);
    // Safe helper to handle both JSON-stringified and raw token strings
    const extractToken = (val) => {
      if (!val) return null;
      try {
        // Try to parse in case it was JSON.stringified (old behavior)
        const parsed = JSON.parse(val);
        return typeof parsed === 'string' ? parsed : val;
      } catch (e) {
        // Fallback to raw value if not valid JSON
        return val;
      }
    };

    // Read access token from cookies, custom header, or existing Authorization header
    let accessToken = req.cookies?.accessToken || extractToken(req.headers["x-access-token"]);

    if (!accessToken && req.headers["authorization"]) {
      const parts = req.headers["authorization"].split(" ");
      if (parts.length === 2 && parts[0] === "Bearer") {
        accessToken = extractToken(parts[1]);
      }
    }

    // If access token exists and is not expired, set it in the Authorization header
    if (accessToken && !Token.isTokenExpired(accessToken)) {
      req.headers["authorization"] = `Bearer ${accessToken}`;
    }

    // If access token is missing or expired, try to refresh it
    if (!accessToken || Token.isTokenExpired(accessToken)) {
      // Read refresh token from cookies or custom header `X-Refresh-Token`
      const refreshToken = req.cookies?.refreshToken || extractToken(req.headers["x-refresh-token"]);
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
    console.log("Error refreshing access token:", error);
    res.status(401).json({
      error: error.message,
      message: "Failed to refresh access token or token is invalid",
    });
  }
};

export default accessTokenAutoRefresh;
