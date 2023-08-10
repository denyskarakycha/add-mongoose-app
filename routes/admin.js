const express = require('express');

const router = express.Router();

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');

// // /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// // /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product', [
    body('title')
        .trim()
        .isString()
        .isLength({min: 3}),
    // body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description')
        .isLength({min:5, max: 100})
], isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product', [
    body('title')
        .trim()
        .isString()
        .isLength({min: 3}),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description')
        .isLength({min:5, max: 100})
], isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
