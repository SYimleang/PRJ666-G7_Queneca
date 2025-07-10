import express, { Request, Response, RequestHandler } from "express";
import {
  authenticate,
  AuthRequest,
  requireAdminOrStaff,
} from "../middleware/auth";
import Menu from "../models/Menu";
import User from "../models/User";

const router = express.Router();

// POST /api/menus - Create Menu (Protected - Admin or Staff)
router.post("/", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { menuItems } = req.body;
    const userId = req.user!.id;

    // Get user to find their restaurantId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.restaurantId) {
      return res
        .status(400)
        .json({ message: "User must be associated with a restaurant" });
    }

    // Validate menuItems
    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      return res.status(400).json({ message: "Menu items are required" });
    }

    // Validate each menu item
    for (const item of menuItems) {
      if (!item.name || !item.price || !item.category || !item.ingredients) {
        return res.status(400).json({
          message:
            "Each menu item must have name, price, category, and ingredients",
        });
      }
    }

    // Check if menu already exists for this restaurant
    const existingMenu = await Menu.findOne({
      restaurantId: user.restaurantId,
    });
    if (existingMenu) {
      return res.status(400).json({
        message:
          "Menu already exists for this restaurant. Use update endpoint to modify.",
      });
    }

    // Create new menu
    const newMenu = await Menu.create({
      restaurantId: user.restaurantId,
      menuItems,
    });

    res.status(201).json({
      message: "Menu created successfully",
      menu: newMenu,
    });
  } catch (error) {
    console.error("Create menu error:", error);
    res.status(500).json({ message: "Server error during menu creation" });
  }
}) as RequestHandler);

// GET /api/menus/restaurant/:restaurantId - Get Menu by Restaurant ID
router.get("/restaurant/:restaurantId", (async (
  req: Request,
  res: Response
) => {
  try {
    const { restaurantId } = req.params;

    const menu = await Menu.findOne({ restaurantId }).populate(
      "restaurantId",
      "name"
    );
    if (!menu) {
      return res
        .status(404)
        .json({ message: "Menu not found for this restaurant" });
    }

    res.status(200).json({ menu });
  } catch (error) {
    console.error("Get menu error:", error);
    res.status(500).json({ message: "Server error while fetching menu" });
  }
}) as RequestHandler);

// PUT /api/menus - Update Menu (Protected - Admin or Staff)
router.put("/", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { menuItems } = req.body;
    const userId = req.user!.id;

    // Get user to find their restaurantId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.restaurantId) {
      return res
        .status(400)
        .json({ message: "User must be associated with a restaurant" });
    }

    // Validate menuItems
    if (!menuItems || !Array.isArray(menuItems)) {
      return res.status(400).json({ message: "Menu items are required" });
    }

    // Validate each menu item
    for (const item of menuItems) {
      if (!item.name || !item.price || !item.category || !item.ingredients) {
        return res.status(400).json({
          message:
            "Each menu item must have name, price, category, and ingredients",
        });
      }
    }

    // Update menu
    const updatedMenu = await Menu.findOneAndUpdate(
      { restaurantId: user.restaurantId },
      { menuItems },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Menu updated successfully",
      menu: updatedMenu,
    });
  } catch (error) {
    console.error("Update menu error:", error);
    res.status(500).json({ message: "Server error during menu update" });
  }
}) as RequestHandler);

// GET /api/menus/my-menu - Get current user's restaurant menu
router.get("/my-menu", authenticate, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    // Get user to find their restaurantId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.restaurantId) {
      return res
        .status(400)
        .json({ message: "User must be associated with a restaurant" });
    }

    const menu = await Menu.findOne({
      restaurantId: user.restaurantId,
    }).populate("restaurantId", "name");
    if (!menu) {
      return res
        .status(404)
        .json({ message: "Menu not found for your restaurant" });
    }

    res.status(200).json({ menu });
  } catch (error) {
    console.error("Get my menu error:", error);
    res.status(500).json({ message: "Server error while fetching menu" });
  }
}) as RequestHandler);

// PUT /api/menus/:id - Update Menu by ID (Protected - Admin or Staff)
router.put("/:id", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { menuItems } = req.body;
    const userId = req.user!.id;

    // Get user to find their restaurantId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.restaurantId) {
      return res
        .status(400)
        .json({ message: "User must be associated with a restaurant" });
    }

    // Validate menuItems
    if (!menuItems || !Array.isArray(menuItems)) {
      return res.status(400).json({ message: "Menu items are required" });
    }

    // Validate each menu item
    for (const item of menuItems) {
      if (!item.name || !item.price || !item.category || !item.ingredients) {
        return res.status(400).json({
          message:
            "Each menu item must have name, price, category, and ingredients",
        });
      }
    }

    // Check if menu exists and belongs to user's restaurant
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    if (menu.restaurantId.toString() !== user.restaurantId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only update menus for your restaurant" });
    }

    // Update menu
    const updatedMenu = await Menu.findByIdAndUpdate(
      id,
      { menuItems },
      { new: true }
    );

    res.status(200).json({
      message: "Menu updated successfully",
      menu: updatedMenu,
    });
  } catch (error) {
    console.error("Update menu by ID error:", error);
    res.status(500).json({ message: "Server error during menu update" });
  }
}) as RequestHandler);

// DELETE /api/menus/:id - Delete Menu (Protected - Admin or Staff)
router.delete("/:id", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get user to find their restaurantId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.restaurantId) {
      return res
        .status(400)
        .json({ message: "User must be associated with a restaurant" });
    }

    // Check if menu exists and belongs to user's restaurant
    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    if (menu.restaurantId.toString() !== user.restaurantId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete menus for your restaurant" });
    }

    // Delete menu
    await Menu.findByIdAndDelete(id);

    res.status(200).json({
      message: "Menu deleted successfully",
    });
  } catch (error) {
    console.error("Delete menu error:", error);
    res.status(500).json({ message: "Server error during menu deletion" });
  }
}) as RequestHandler);

// POST /api/menus/item - Add single menu item (Protected - Admin or Staff)
router.post("/item", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const newItem = req.body;
    const userId = req.user!.id;

    // Get user to find their restaurantId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.restaurantId) {
      return res
        .status(400)
        .json({ message: "User must be associated with a restaurant" });
    }

    // Validate menu item
    if (
      !newItem.name ||
      !newItem.price ||
      !newItem.category ||
      !newItem.ingredients
    ) {
      return res.status(400).json({
        message: "Menu item must have name, price, category, and ingredients",
      });
    }

    // Find existing menu or create new one
    let menu = await Menu.findOne({ restaurantId: user.restaurantId });

    if (!menu) {
      // Create new menu with the item
      menu = await Menu.create({
        restaurantId: user.restaurantId,
        menuItems: [newItem],
      });
    } else {
      // Add item to existing menu
      menu.menuItems.push(newItem);
      await menu.save();
    }

    res.status(201).json({
      message: "Menu item added successfully",
      menu: menu,
    });
  } catch (error) {
    console.error("Add menu item error:", error);
    res.status(500).json({ message: "Server error during menu item addition" });
  }
}) as RequestHandler);

// PUT /api/menus/item/:index - Update single menu item by index (Protected - Admin or Staff)
router.put("/item/:index", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { index } = req.params;
    const updatedItem = req.body;
    const userId = req.user!.id;
    const itemIndex = parseInt(index);

    if (isNaN(itemIndex) || itemIndex < 0) {
      return res.status(400).json({ message: "Invalid item index" });
    }

    // Get user to find their restaurantId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.restaurantId) {
      return res
        .status(400)
        .json({ message: "User must be associated with a restaurant" });
    }

    // Validate menu item
    if (
      !updatedItem.name ||
      !updatedItem.price ||
      !updatedItem.category ||
      !updatedItem.ingredients
    ) {
      return res.status(400).json({
        message: "Menu item must have name, price, category, and ingredients",
      });
    }

    // Find menu
    const menu = await Menu.findOne({ restaurantId: user.restaurantId });
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    if (itemIndex >= menu.menuItems.length) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Update the specific item
    menu.menuItems[itemIndex] = updatedItem;
    await menu.save();

    res.status(200).json({
      message: "Menu item updated successfully",
      menu: menu,
    });
  } catch (error) {
    console.error("Update menu item error:", error);
    res.status(500).json({ message: "Server error during menu item update" });
  }
}) as RequestHandler);

// DELETE /api/menus/item/:index - Delete single menu item by index (Protected - Admin or Staff)
router.delete("/item/:index", authenticate, requireAdminOrStaff, (async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { index } = req.params;
    const userId = req.user!.id;
    const itemIndex = parseInt(index);

    if (isNaN(itemIndex) || itemIndex < 0) {
      return res.status(400).json({ message: "Invalid item index" });
    }

    // Get user to find their restaurantId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.restaurantId) {
      return res
        .status(400)
        .json({ message: "User must be associated with a restaurant" });
    }

    // Find menu
    const menu = await Menu.findOne({ restaurantId: user.restaurantId });
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    if (itemIndex >= menu.menuItems.length) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Remove the specific item
    menu.menuItems.splice(itemIndex, 1);
    await menu.save();

    res.status(200).json({
      message: "Menu item deleted successfully",
      menu: menu,
    });
  } catch (error) {
    console.error("Delete menu item error:", error);
    res.status(500).json({ message: "Server error during menu item deletion" });
  }
}) as RequestHandler);

export default router;
