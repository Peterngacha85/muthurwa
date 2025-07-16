const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { getAllVendors, getVendorsWithStats, updateVendor, deleteVendor } = require('../controllers/authController');
const auth = require('../middlewares/auth');

const router = express.Router();


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               location:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, vendor]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authController.register
);


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  [
    body('phone').notEmpty().withMessage('Phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

/**
 * @swagger
 * /api/auth/vendors:
 *   get:
 *     summary: Get all vendors (admin only)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: List of vendors
 *       403:
 *         description: Forbidden
 */
router.get('/vendors', auth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Forbidden' });
  }
  next();
}, getAllVendors);

/**
 * @swagger
 * /api/auth/vendors/stats:
 *   get:
 *     summary: Get all vendors with their stats (admin only)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: List of vendors with stats
 *       403:
 *         description: Forbidden
 */
router.get('/vendors/stats', auth, (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Forbidden' });
  }
  next();
}, getVendorsWithStats);

router.put('/vendor/:id', auth, updateVendor);
router.delete('/vendor/:id', auth, deleteVendor);

module.exports = router;
