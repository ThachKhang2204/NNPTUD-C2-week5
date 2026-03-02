var express = require('express');
var router = express.Router();

/* GET home page - API Info */
router.get('/', function (req, res, next) {
  res.json({
    success: true,
    message: 'Welcome to NNPTUD API',
    version: '1.0.0',
    endpoints: {
      users: '/api/v1/users',
      roles: '/api/v1/roles',
      categories: '/api/v1/categories',
      products: '/api/v1/products'
    }
  });
});

module.exports = router;
