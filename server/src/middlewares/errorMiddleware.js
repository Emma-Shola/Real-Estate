const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  console.error(`[${req.requestId || 'n/a'}]`, err);

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid resource ID',
      requestId: req.requestId,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate key error',
      requestId: req.requestId,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && isProd ? 'Internal server error' : err.message || 'Internal server error',
    requestId: req.requestId,
    ...(isProd ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
