const { customError, customFail } = require("./customResponses");

async function catchDbErrors(statement) {
  try {
    return await statement;
  } catch (error) {
    if (error.isClientError) {
      throw new customFail(error.message);
    } else {
      throw new customError(error.message);
    }
  }
}

module.exports = catchDbErrors;
