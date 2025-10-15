// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   phone_Number: {
//     type: Number,
//     // required: true,
//     // unique: true,
//   },
//   email: {
//     type: String,
//     // required: true,
//     unique: true,
//   },
//   role: {
//     type: String,
//     enum: ["admin", "moderator", "content"],
//     default: "content",
//   },
  

//   displayName: {
//     type: String,
//     required: true,
//   }, 
//   createdTime: {
//     type: Date,
//     default: Date.now,
//   },
//   last_logged_in: {
//     type: Date,
//   },
//   fcmToken: {
//     type: String,
//   },
//   profileImage: {
//     type: String,
//   },

//   preferences: {
//     categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
//   },

//   clickedNews: [
//     {
//       newsId: { type: mongoose.Schema.Types.ObjectId, ref: "News" },
//       timestamp: { type: Date, default: Date.now },
//     },
//   ],

//   likedNews: [
//     {
//       newsId: { type: mongoose.Schema.Types.ObjectId, ref: "News" },
//       timestamp: { type: Date, default: Date.now },
//     },
//   ],
//   likedVideos: [
//     {
//       videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
//       timestamp: { type: Date, default: Date.now },
//     },
//   ],
//   categoryPreferences: {
//     type: Map,
//     of: Number,
//     default: {},
//   },
// });

// module.exports = mongoose.model("User", userSchema);



// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");

// const userSchema = new mongoose.Schema({
//   phone_Number: {
//     type: Number,
//     unique: true,
//     sparse: true
//   },
//   email: {
//     type: String,
//     unique: true,
//     sparse: true
//   },
//   password: {
//     type: String,
//     select: false
//   },
//   role: {
//     type: String,
//     enum: ["admin", "moderator", "user", "content"],
//     default: "user",
//   },  
//   displayName: {
//     type: String,
//     required: true,
//   }, 
//   createdTime: {
//     type: Date,
//     default: Date.now,
//   },
//   last_logged_in: {
//     type: Date,
//   },
//   refreshToken: {
//     type: String,
//     select: false
//   },
//   fcmToken: {
//     type: String,
//   },
//   profileImage: {
//     type: String,
//   },
//   preferences: {
//     categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
//   },
//   clickedNews: [
//     {
//       newsId: { type: mongoose.Schema.Types.ObjectId, ref: "News" },
//       timestamp: { type: Date, default: Date.now },
//     },
//   ],
//   likedNews: [
//     {
//       newsId: { type: mongoose.Schema.Types.ObjectId, ref: "News" },
//       timestamp: { type: Date, default: Date.now },
//     },
//   ],
//   likedVideos: [
//     {
//       videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
//       timestamp: { type: Date, default: Date.now },
//     },
//   ],
//   categoryPreferences: {
//     type: Map,
//     of: Number,
//     default: {},
//   },
// });

// // Method to generate JWT tokens
// userSchema.methods.generateAuthToken = function() {
//   const accessToken = jwt.sign(
//     { 
//       id: this._id, 
//       email: this.email, 
//       role: this.role 
//     },
//     process.env.JWT_ACCESS_SECRET,
//     { expiresIn: '1d' }
//   );
  
//   const refreshToken = jwt.sign(
//     { id: this._id },
//     process.env.JWT_REFRESH_SECRET,
//     { expiresIn: '7d' }
//   );
  
//   return { accessToken, refreshToken };
// };

// module.exports = mongoose.model("User", userSchema);


const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  phone_Number: {
    type: Number,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    select: false
  },
  role: {
    type: String,
    enum: ["admin", "moderator", "user", "content"],
    default: "user",
  },  
  // displayName: {
  //   type: String,
  //   required: true,
  // }, 
  createdTime: {
    type: Date,
    default: Date.now,
  },
  last_logged_in: {
    type: Date,
  },
  refreshToken: {
    type: String,
    select: false
  },
  fcmToken: {
    type: String,
  },
  profileImage: {
    type: String,
  },
  preferences: {
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  },
  clickedNews: [
    {
      newsId: { type: mongoose.Schema.Types.ObjectId, ref: "News" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  likedNews: [
    {
      newsId: { type: mongoose.Schema.Types.ObjectId, ref: "News" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  likedVideos: [
    {
      videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  categoryPreferences: {
    type: Map,
    of: Number,
    default: {},
  },
});

// Method to generate JWT tokens
userSchema.methods.generateAuthToken = function() {
  const accessToken = jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role 
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' } // align with cookie maxAge (15 mins)
  );
  
  const refreshToken = jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

module.exports = mongoose.model("User", userSchema);
