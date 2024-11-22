const express = require("express");
const { mongoose } = require("mongoose");
require("dotenv").config();
const asyncHandler = require("./utils/asyncHandler");
const { CustomFail } = require("./utils/customResponses");
const ProductRouter = require("./routes/product");
const path = require("path");

var cors = require("cors");
const UserRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const CommentRouter = require("./routes/comment");
const NotificationRouter = require("./routes/notification");
const OrderRouter = require("./routes/order");
const RoleRequestRouter = require("./routes/roleRequest");
const DonationHistoryRouter = require("./routes/donationHistory");
const GroupRouter = require("./routes/group");
const app = express();

//app middelwares
app.use(express.static(path.join(__dirname, "productsImages")));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.json());

app.use(cors());

app.use("/api/product", ProductRouter);
// app.use("/api/auth", authRouter);
// app.use("/api/order", OrderRouter);
// app.use("/api/donationHistory", DonationHistoryRouter);
// app.use("/api/comment", CommentRouter);
// app.use("/api/notification", NotificationRouter);
// app.use("/api/roleRequest", RoleRequestRouter);
// app.use("/api/user", UserRouter);
// app.use("/api/group",GroupRouter);

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
