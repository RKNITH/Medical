import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "15m",
    });
};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};

const isProduction = process.env.NODE_ENV === "production";

export const setTokenCookies = (res, accessToken, refreshToken) => {
    const base = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    };

    // BUG FIX: accessToken cookie was set to 1 day but JWT expires in 15 min.
    // The cookie would persist but every request after 15m would get a 401 until
    // the silent refresh ran. Set the cookie maxAge to match the token TTL so
    // expired cookies are cleaned up automatically.
    res.cookie("accessToken", accessToken, {
        ...base,
        maxAge: 15 * 60 * 1000,  // 15 minutes — matches JWT expiresIn
    });

    res.cookie("refreshToken", refreshToken, {
        ...base,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export const clearTokenCookies = (res) => {
    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
    };
    res.cookie("accessToken", "", { ...options, maxAge: 0 });
    res.cookie("refreshToken", "", { ...options, maxAge: 0 });
};
