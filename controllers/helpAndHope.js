const HelpAndHopeModel = require("../models/helpAndHope");
const catchDbErrors = require("../utils/catchDbErros");
const { CustomFail, CustomSuccess } = require("../utils/customResponses");

/**
 * @method get
 * @route : ~/api/helpAndHope
 * @desc  : get all Help And Hope Products
 * @access : visitor
 */
async function getAllHelpAndHopeProductsController(req, res) {
  const products = await catchDbErrors(HelpAndHopeModel.find());
  if (!products.length) {
    throw new CustomFail("no products found");
  }
  res.json(new CustomSuccess(products));
}

/**
 * @method get
 * @route : ~/api/helpAndHope/:id
 * @desc  : get single Help And Hope Product
 * @access : admin
 */
async function getSingleHelpAndHopeProductController(req, res) {
  const { id } = req.params;
  const product = await catchDbErrors(HelpAndHopeModel.findById(id));
  if (!product) {
    throw new CustomFail("Product not found.");
  }
  res.json(new CustomSuccess(product));
}

/**
 * @method post
 * @route /api/helpAndHope/create
 * @desc  : Add a new Help And Hope Product
 * @access : Admin
 */
async function postNewHelpAndHopeProductController(req, res) {
  const { title, coins, theme } = req.body;

  if (
    !["medicine", "school", "wedding", "eid", "ramadan", "winter"].includes(
      theme
    )
  ) {
    throw new CustomFail("Invalid theme provided.");
  }

  let imagePath;
  switch (theme) {
    case "medicine":
      imagePath = "medicine.gif";
      break;
    case "school":
      imagePath = "school.gif";
      break;
    case "wedding":
      imagePath = "wedding.gif";
      break;
    case "eid":
      imagePath = "eid.png";
      break;
    case "ramadan":
      imagePath = "ramadan.gif";
      break;
    case "winter":
      imagePath = "winter.gif";
      break;
    default:
      imagePath = "eid.png";
      break;
  }

  const newProduct = await catchDbErrors(
    HelpAndHopeModel.create({
      title,
      coins,
      theme,
      image: imagePath,
    })
  );

  res.status(201).json({
    status: "success",
    data: newProduct,
  });
}

/**
 * @method put
 * @route /api/helpAndHope/update/:id
 * @desc  : update Help And Hope Product
 * @access : Admin
 */
async function updateHelpAndHopeProductController(req, res) {
  const { id } = req.params;
  const { title, coins, theme } = req.body;

  if (
    !["medicine", "school", "wedding", "eid", "ramadan", "winter"].includes(
      theme
    )
  ) {
    return res.status(400).json({ message: "Invalid theme provided." });
  }

  let imagePath;
  switch (theme) {
    case "medicine":
      imagePath = "/medicine.gif";
      break;
    case "school":
      imagePath = "/school.gif";
      break;
    case "wedding":
      imagePath = "/wedding.gif";
      break;
    case "eid":
      imagePath = "/eid.png";
      break;
    case "ramadan":
      imagePath = "/ramadan.gif";
      break;
    case "winter":
      imagePath = "/winter.gif";
      break;
    default:
      imagePath = "/eid.png";
      break;
  }

  const updatedProduct = await catchDbErrors(
    HelpAndHopeModel.findByIdAndUpdate(
      id,
      {
        title,
        coins,
        theme,
        image: imagePath,
      },
      { new: true, runValidators: true }
    )
  );

  if (!updatedProduct) {
    return res.status(404).json({ message: "Product not found." });
  }

  res.status(200).json({
    status: "success",
    data: updatedProduct,
  });
}

/**
 * @method delete
 * @route /api/helpAndHope/delete/:id
 * @desc  : delete Help And Hope Product
 * @access : Admin
 */
async function deleteHelpAndHopeProductController(req, res) {
  const { id } = req.params;
  const deletedProduct = await catchDbErrors(
    HelpAndHopeModel.findByIdAndDelete(id)
  );

  if (!deletedProduct) {
    return res.status(404).json({ message: "Product not found." });
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
}

module.exports = {
  getAllHelpAndHopeProductsController,
  postNewHelpAndHopeProductController,
  deleteHelpAndHopeProductController,
  updateHelpAndHopeProductController,
  getSingleHelpAndHopeProductController,
};
