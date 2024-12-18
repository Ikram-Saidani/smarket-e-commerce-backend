const { Schema, model,Types } = require("mongoose");
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
    role: {
      type: String,
      enum: ["admin", "coordinator", "ambassador", "user"],
      default: "user",
    },
    groupId: {
      type: Types.ObjectId,
      ref: "group",
      default: null,
    },
    discountEarnedWithGroup: { type: Number, default: 0 },
    coinsEarned: {
      type: Number,
      default: 0,
    },
    lastSpinTime: {
      type: Date,
    },
    avatar: { type: String , default:"/men-avatar.png"    },
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
