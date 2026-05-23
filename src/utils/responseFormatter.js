// Consistent API response formatter
const formatResponse = (success, message, data = null, statusCode = 200) => {
  return {
    success,
    message,
    ...(data && { data }),
    statusCode,
  };
};

// Format success response
const formatSuccessResponse = (message, data = null) => {
  return formatResponse(true, message, data, 200);
};

// Format error response
const formatErrorResponse = (message, statusCode = 400, data = null) => {
  return formatResponse(false, message, data, statusCode);
};

module.exports = {
  formatResponse,
  formatSuccessResponse,
  formatErrorResponse,
};
