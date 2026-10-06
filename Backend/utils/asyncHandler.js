const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(req, res, next).catch(next);
};

module.exports = asyncHandler;
