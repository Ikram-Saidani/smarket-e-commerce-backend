const { CustomError, CustomFail } = require("./customResponses");

async function catchDbErrors(statement) {
  try {
    return await statement;
  } catch (error) {
    if (error.isClientError) {
      throw new CustomFail(error.message);
    } else {
      throw new CustomError(error.message);
    }
  }
}

module.exports = catchDbErrors;
