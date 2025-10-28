// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');
 
// const authenticateJWT = (req, res, next) => {
//     const token = req.header('Authorization')?.split(' ')[1];
 
//     if (!token) {
//         return res.status(401).send('Access Denied');
//     }
//     jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
//         if (err) return res.status(401).send('Invalid Token');
//         const userData = await User.findOne({ email: user.username });
//         if(userData.isBlocked){
//             return res.status(401).send('Account is blocked');
//         }
//         if (userData.refreshToken != user.refreshToken) {
//             return res.status(401).send('Invalid Token');
//         }
 
//         req.user = user;
 
//         next();
//     });
// };
 
// module.exports = authenticateJWT;







// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');

// const authenticateJWT = async (req, res, next) => {
//   const token = req.header('Authorization')?.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ success: false, message: 'Access Denied' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

//     const user = await User.findById(decoded.id).select('+refreshToken');
//     if (!user) {
//       return res.status(401).json({ success: false, message: 'Invalid Token' });
//     }

//     // Optional: Check if user is blocked
//     if (user.isBlocked) {
//       return res.status(403).json({ success: false, message: 'Account is blocked' });
//     }

//     req.user = {
//       id: user._id,
//       role: user.role,
//       email: user.email
//     };
//     req.userId = user._id; // For consistency with your logout route

//     next();
//   } catch (err) {
//     return res.status(401).json({ success: false, message: 'Invalid or expired token' });
//   }
// };

// module.exports = authenticateJWT;



// middlewares/authenticateJWT.js
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

function extractAccessToken(req) {
  const auth = req.headers.authorization || req.header("Authorization");
  if (auth && auth.startsWith("Bearer ")) {
    return auth.split(" ")[1];
  }
  if (req.cookies && req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  if (req.query && req.query.access_token) {
    return req.query.access_token;
  }
  return null;
}

const authenticateJWT = async (req, res, next) => {

  const token = extractAccessToken(req);
 
  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied: missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(401).json({ success: false, message: "Invalid token: user not found" });

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: "Account is blocked" });
    }

    req.user = { id: user._id, role: user.role, email: user.email };
    req.userId = user._id;
    next();
  } catch (err) {
    console.error("❌ Token verification error:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};


module.exports = authenticateJWT;










// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');

// const authenticateJWT = async (req, res, next) => {
//   // Check for token in multiple locations (header, cookies, query params)
//   const token = req.header('Authorization')?.replace('Bearer ', '') || 
//                 req.cookies?.accessToken ||
//                 req.query?.token;

//   if (!token) {
//     return res.status(401).json({ 
//       success: false, 
//       message: 'Authentication required: No token provided',
//       code: 'NO_TOKEN'
//     });
//   }

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
//       ignoreExpiration: false // Explicitly check for expiration
//     });

//     // Get user with sensitive fields
//     const user = await User.findById(decoded.id)
//       .select('+refreshToken +isBlocked +passwordChangedAt');

//     if (!user) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'User account not found',
//         code: 'USER_NOT_FOUND'
//       });
//     }

//     // Check if user is blocked
//     if (user.isBlocked) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Account is temporarily blocked',
//         code: 'ACCOUNT_BLOCKED'
//       });
//     }

//     // Check if password was changed after token was issued
//     if (user.passwordChangedAt && decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Password was changed. Please log in again.',
//         code: 'PASSWORD_CHANGED'
//       });
//     }

//     // Check if token is in the refresh token family (if using token rotation)
//     if (user.refreshToken && decoded.isRefreshToken) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'Invalid token type',
//         code: 'INVALID_TOKEN_TYPE'
//       });
//     }

//     // Attach user to request
//     req.user = {
//       id: user._id,
//       role: user.role,
//       email: user.email,
//       displayName: user.displayName,
//       profileImage: user.profileImage
//     };
    
//     // For backward compatibility
//     req.userId = user._id;

//     // Continue to next middleware
//     next();
//   } catch (err) {
//     // Handle specific JWT errors
//     let statusCode = 401;
//     let message = 'Authentication failed';
//     let code = 'AUTH_FAILED';

//     if (err.name === 'TokenExpiredError') {
//       message = 'Session expired. Please log in again.';
//       code = 'TOKEN_EXPIRED';
//     } else if (err.name === 'JsonWebTokenError') {
//       message = 'Invalid authentication token';
//       code = 'INVALID_TOKEN';
//     } else if (err.name === 'NotBeforeError') {
//       message = 'Token not yet valid';
//       code = 'TOKEN_NOT_ACTIVE';
//     } else {
//       statusCode = 500;
//       message = 'Internal server error during authentication';
//       code = 'SERVER_ERROR';
//     }

//     return res.status(statusCode).json({ 
//       success: false, 
//       message,
//       code,
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

// module.exports = authenticateJWT;