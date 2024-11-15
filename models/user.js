const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^[a-zA-Z]+ [a-zA-Z]+$/.test(value);
        },
        message:
          "Name must contain a first and last name, separated by a space.",
      },
    },
    email: {
      type: String,
      required: true,
      unique: [true, "email already used"],
      validate: [validator.isEmail, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    address: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: (value) => validator.isMobilePhone(value, "any"),
        message: "Please provide a valid phone number",
      },
    },
    gender: {
      type: String,
      enum: ["female", "male"],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    comments: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "product",
        },
        text: {
          type: String,
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    role: {
      type: String,
      enum: ["admin", "coordinator", "ambassador", "user"],
      default: "user",
    },
    socketId: {
      type: String,
      default: null,
    },
    notifications: [
      {
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],
    donationHistory: [
      {
        productDonated: {
          type: Schema.Types.ObjectId,
          ref: "product",
        },
        coins: {
          type: Number,
          min: [0, "Coins must be a positive number"],
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    coinsEarned: {
      type: Number,
      default: 0,
    },
    avatar: { type: String, default: "/images.png" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", function (next) {
  const salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(this.password, salt);
  this.password = hash;
  next();
});

const UserModel = model("user", userSchema);

module.exports = UserModel;
