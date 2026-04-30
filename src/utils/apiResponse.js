function success(data, message) {
  return {
    success: true,
    message: message || null,
    data
  };
}

function error(code, message, details) {
  return {
    success: false,
    error: {
      code,
      message,
      details: details || null
    }
  };
}

module.exports = {
  success,
  error
};
