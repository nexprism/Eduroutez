const setTokensCookies = (res, accessToken, refreshToken, newAccessTokenExp, newRefreshTokenExp) => {
  console.log('acesstoken',accessToken)
  console.log('refreshToken',refreshToken)
  console.log('newAccessTokenExp',newAccessTokenExp)
  console.log('newRefreshTokenExp',newRefreshTokenExp)

  console.log('res',res)


  const accessTokenMaxAge = (newAccessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  const refreshTokenmaxAge = (newRefreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;

  // Set Cookie for Access Token
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: true,
    maxAge: accessTokenMaxAge,
    sameSite: "lax", // Adjust according to your requirements
  });

  // Set Cookie for Refresh Token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: true,
    maxAge: refreshTokenmaxAge,
    sameSite: "lax", // Adjust according to your requirements
  });
  // Set Cookie for is_auth
  res.cookie("is_auth", true, {
    httpOnly: false,
    // secure: process.env.NODE_ENV === "production",
    secure: true,
    maxAge: refreshTokenmaxAge,
    sameSite: "lax", // Adjust according to your requirements
  });
};

export { setTokensCookies };
