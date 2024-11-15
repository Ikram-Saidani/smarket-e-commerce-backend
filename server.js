const express = require("express");
const { mongoose } = require("mongoose");
require("dotenv").config();
const asyncHandler = require("./utils/asyncHandler");
const { CustomFail } = require("./utils/customResponses");
const ProductRouter = require("./routes/product");
const path = require("path");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// var cors = require("cors");
const UserRouter = require("./routes/user");
const authRouter = require("./routes/auth");

const app = express();

//app middelwares
app.use(express.static(path.join(__dirname, "productsImages")));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.json());

// app.use(cors());

app.use("/api/product", ProductRouter);
app.use("/api/auth", authRouter);
// app.use("/api/order", OrderRouter);
app.use("/api/user", UserRouter);

// 404 handler
app.all(
  "*",
  asyncHandler(async function (req, res, next) {
    throw new CustomFail("Page not found", 404);
  })
);

// General error handler
app.use(function (error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const status = error.status || "ERROR";

  res.status(statusCode).json({
    status,
    error: error.message,
  });
});

const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.DB_URI, { dbName: "smarket" })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log(error));
