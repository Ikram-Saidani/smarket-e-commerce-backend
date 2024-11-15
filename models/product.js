const { Schema, model } = require("mongoose");

const categories = [
  "fashion",
  "bags",
  "footwear",
  "jewellery",
  "beauty",
  "electronics",
  "groceries",
];

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      minLength: [3, "Title must be at least 3 characters long"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minLength: [10, "Description must be at least 10 characters long"],
    },
    category: {
      type: String,
      required: true,
      enum: categories,
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price must be a positive number"],
    },
    oldPrice: {
      type: Number,
      min: [0, "Old price must be a positive number"],
    },
    discount: {
      type: Number,
      min: [0, "Discount must be between 0 and 100"],
      max: [100, "Discount must be between 0 and 100"],
    },
    coins: {
      type: Number,
      default: 0,
      min: [0, "Coins cannot be negative"],
    },

    countInStock: {
      type: Number,
      default: 0,
      min: [0, "Total quantity cannot be negative"],
    },

    inStock: {
      type: Boolean,
      default: function () {
        return this.countInStock > 0;
      },
    },
    saleCount: {
      type: Number,
      default: 0,
      min: [0, "Sale count cannot be negative"],
    },

    rate: {
      ratingCount: {
        type: Number,
        default: 0,
        min: [0, "Rating count cannot be negative"],
      },
      rating: {
        type: Number,
        default: 0,
        min: [0, "Rating must be between 0 and 5"],
        max: [5, "Rating must be between 0 and 5"],
      },
    },

    image: {
      type: String,
      required: true,
      validate: {
        validator: (value) =>
          /^https?:\/\/.*\.(jpeg|jpg|png|gif)$/i.test(value),
        message: "Invalid image URL format",
      },
    },
    
    size: [
      {
        size: {
          type: String,
          enum: ["XS", "S", "M", "L", "XL", "XXL"],
          required: function () {
            return this.category === "fashion";
          },
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    shoeSize: [
      {
        shoeSize: {
          type: String,
          enum: Array.from({ length: 31 }, (_, i) => (i + 20).toString()),
          required: function () {
            return this.category === "footwear";
          },
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    specifications: {
      type: Map,
      of: String,
      required: function () {
        return this.category === "electronics";
      },
    },
    ingredients: {
      type: [String],
      required: function () {
        return this.category === "beauty";
      },
    },

    expiryDate: {
      type: Date,
      required: function () {
        return this.category === "groceries";
      },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ title: 1 });
productSchema.index({ "rate.rating": 1 });
productSchema.index({ coins: 1 });

productSchema.virtual("calculatedPrice").get(function () {
  if (this.oldPrice && this.discount) {
    return this.oldPrice * (1 - this.discount / 100);
  }

  return this.price || 0;
});

productSchema.virtual("calculatedCoins").get(function () {
  return this.price ? Math.floor((this.price * 3) / 2) : 0;
});

productSchema.pre("save", function (next) {
  if (this.category === "fashion" && Array.isArray(this.size)) {
    this.countInStock = this.size.reduce(
      (total, item) => total + item.quantity,
      0
    );
  } else if (this.category === "footwear" && Array.isArray(this.shoeSize)) {
    this.countInStock = this.shoeSize.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }

  if (this.oldPrice && this.discount) {
    this.price = this.oldPrice * (1 - this.discount / 100);
  }

  if (this.price) {
    this.coins = Math.floor((this.price * 3) / 2);
  }

  next();
});

const ProductModel = model("product", productSchema);

module.exports = ProductModel;
