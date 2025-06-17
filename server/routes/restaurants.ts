import express, { Request, Response, RequestHandler } from 'express';
import {
  authenticate,
  requireAdmin,
  requireAdminOrStaff,
  AuthRequest,
} from '../middleware/auth';
import Restaurant from '../models/Restaurant';
import User from '../models/User';
import QRCode from 'qrcode';
import { generateToken } from '../lib/auth';

const router = express.Router();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

// POST /api/restaurants - Create Restaurant
router.post('/', authenticate, (async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, location, hours } = req.body;
    const adminId = req.user!.id;
    // Validate required fields
    if (!name || !phone || !location || !hours) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate location fields
    if (
      !location.address ||
      !location.city ||
      !location.region ||
      !location.zip
    ) {
      return res
        .status(400)
        .json({ message: 'Complete location information is required' });
    }

    // Validate hours fields
    if (!hours.open || !hours.close) {
      return res
        .status(400)
        .json({ message: 'Opening and closing hours are required' });
    }

    // Check if admin already has a restaurant
    const existingRestaurant = await Restaurant.findOne({ ownerId: adminId });
    if (existingRestaurant) {
      return res
        .status(400)
        .json({ message: 'Admin already has a restaurant' });
    }

    // Create new restaurant
    const newRestaurant = await Restaurant.create({
      name,
      phone,
      location,
      hours,
      ownerId: adminId,
    });

    // generate qr
    const url = `${clientUrl}/restaurant/${newRestaurant._id}`;
    const qr = await QRCode.toDataURL(url); // base64 img string

    // append qr to restaurant
    await Restaurant.findByIdAndUpdate(newRestaurant._id, {
      qrCode: qr,
    });

    // needed to include qrCode in response
    const updatedRestaurant = await Restaurant.findById(newRestaurant._id);

    // Update admin user with restaurantId and role admin
    const updatedUser = await User.findByIdAndUpdate(
      adminId,
      { restaurantId: newRestaurant._id, role: 'admin' },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error('Failed to update user: user not found');
    }
    // new token with updated role
    const token = generateToken({
      id: String(updatedUser._id),
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
      phone: updatedUser.phone,
      restaurantId: updatedUser.restaurantId,
    });

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: updatedRestaurant,
      token,
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res
      .status(500)
      .json({ message: 'Server error during restaurant creation' });
  }
}) as RequestHandler);

// GET /api/restaurants/:id - Get Restaurant by ID
router.get('/:id', (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id).populate(
      'ownerId',
      'name email'
    );
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.status(200).json({ restaurant });
  } catch (error) {
    console.error('Get restaurant error:', error);
    res.status(500).json({ message: 'Server error while fetching restaurant' });
  }
}) as RequestHandler);

// GET /api/restaurants - Get all restaurants
router.get('/', (async (req: Request, res: Response) => {
  try {
    const restaurants = await Restaurant.find().populate(
      'ownerId',
      'name email'
    );
    res.status(200).json({ restaurants });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res
      .status(500)
      .json({ message: 'Server error while fetching restaurants' });
  }
}) as RequestHandler);

// PUT /api/restaurants/:id - Update Restaurant (Protected, admin only)
router.put('/:id', authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, phone, location, hours } = req.body;
    const adminId = req.user!.id;

    // Validate required fields
    if (!name || !phone || !location || !hours) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate location fields
    if (
      !location.address ||
      !location.city ||
      !location.region ||
      !location.zip
    ) {
      return res
        .status(400)
        .json({ message: 'Complete location information is required' });
    }

    // Validate hours fields
    if (!hours.open || !hours.close) {
      return res
        .status(400)
        .json({ message: 'Opening and closing hours are required' });
    }

    // Check if restaurant exists and belongs to the admin
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.ownerId.toString() !== adminId) {
      return res
        .status(403)
        .json({ message: 'You can only update your own restaurant' });
    }

    // Update restaurant
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      { name, phone, location, hours },
      { new: true }
    );

    res.status(200).json({
      message: 'Restaurant updated successfully',
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({ message: 'Server error during restaurant update' });
  }
}) as RequestHandler);

// DELETE /api/restaurants/:id - Delete Restaurant (Protected, admin only)
router.delete('/:id', authenticate, requireAdmin, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    // Check if restaurant exists and belongs to the admin
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.ownerId.toString() !== adminId) {
      return res
        .status(403)
        .json({ message: 'You can only delete your own restaurant' });
    }

    // Delete restaurant
    await Restaurant.findByIdAndDelete(id);

    // Remove restaurantId from admin user
    await User.findByIdAndUpdate(adminId, { restaurantId: null });

    res.status(200).json({
      message: 'Restaurant deleted successfully',
    });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res
      .status(500)
      .json({ message: 'Server error during restaurant deletion' });
  }
}) as RequestHandler);

// GET /api/restaurants/:id/waitlist-settings - Get restaurant waitlist settings (Protected)
router.get('/:id/waitlist-settings', authenticate, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get user to check permissions
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find restaurant
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if user owns this restaurant or is admin/staff
    if (restaurant.ownerId.toString() !== userId && user.role !== 'admin') {
      return res.status(403).json({
        message:
          'Access denied. You can only view settings for your own restaurant.',
      });
    }

    res.status(200).json({
      waitlistSettings: restaurant.waitlistSettings,
    });
  } catch (error) {
    console.error('Get waitlist settings error:', error);
    res
      .status(500)
      .json({ message: 'Server error while fetching waitlist settings' });
  }
}) as RequestHandler);

// PUT /api/restaurants/:id/waitlist-settings - Update restaurant waitlist settings (Protected - Admin)
router.put('/:id/waitlist-settings', authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const {
      autoRemoveMinutes,
      maxCapacity,
      estimatedWaitTimePerCustomer,
      tableReadyNotificationMessage,
    } = req.body;
    const userId = req.user!.id;

    // Get user to check permissions
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find restaurant
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if user owns this restaurant
    if (restaurant.ownerId.toString() !== userId) {
      return res.status(403).json({
        message:
          'Access denied. You can only update settings for your own restaurant.',
      });
    }

    // Validate inputs
    if (autoRemoveMinutes !== undefined) {
      if (
        typeof autoRemoveMinutes !== 'number' ||
        autoRemoveMinutes < 1 ||
        autoRemoveMinutes > 1440
      ) {
        return res.status(400).json({
          message: 'Auto-remove minutes must be a number between 1 and 1440',
        });
      }
    }

    if (maxCapacity !== undefined) {
      if (
        typeof maxCapacity !== 'number' ||
        maxCapacity < 1 ||
        maxCapacity > 1000
      ) {
        return res.status(400).json({
          message: 'Max capacity must be a number between 1 and 1000',
        });
      }
    }

    if (estimatedWaitTimePerCustomer !== undefined) {
      if (
        typeof estimatedWaitTimePerCustomer !== 'number' ||
        estimatedWaitTimePerCustomer < 1 ||
        estimatedWaitTimePerCustomer > 240
      ) {
        return res.status(400).json({
          message:
            'Estimated wait time per customer must be a number between 1 and 240 minutes',
        });
      }
    }

    if (tableReadyNotificationMessage !== undefined) {
      if (
        typeof tableReadyNotificationMessage !== 'string' ||
        tableReadyNotificationMessage.trim().length === 0
      ) {
        return res.status(400).json({
          message: 'Table ready notification message cannot be empty',
        });
      }
      if (tableReadyNotificationMessage.length > 500) {
        return res.status(400).json({
          message:
            'Table ready notification message cannot exceed 500 characters',
        });
      }
    }

    // Update waitlist settings
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      {
        $set: {
          'waitlistSettings.autoRemoveMinutes':
            autoRemoveMinutes ?? restaurant.waitlistSettings.autoRemoveMinutes,
          'waitlistSettings.maxCapacity':
            maxCapacity ?? restaurant.waitlistSettings.maxCapacity,
          'waitlistSettings.estimatedWaitTimePerCustomer':
            estimatedWaitTimePerCustomer ??
            restaurant.waitlistSettings.estimatedWaitTimePerCustomer,
          'waitlistSettings.tableReadyNotificationMessage':
            tableReadyNotificationMessage ??
            restaurant.waitlistSettings.tableReadyNotificationMessage,
        },
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Waitlist settings updated successfully',
      waitlistSettings: updatedRestaurant!.waitlistSettings,
    });
  } catch (error) {
    console.error('Update waitlist settings error:', error);
    res
      .status(500)
      .json({ message: 'Server error while updating waitlist settings' });
  }
}) as RequestHandler);

export default router;
