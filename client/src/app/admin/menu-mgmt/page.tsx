"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IMenuItem, IMenu } from "@/types/menu";
import { useUser } from "@/context/UserContext";
import AdminNav from "@/components/AdminNav";
import { Separator } from "@/components/ui/separator";

const CATEGORIES = ["Appetizer", "Main Course", "Dessert", "Beverage", "Side"];

export default function MenuManagement() {
  const { user } = useUser();
  const [menu, setMenu] = useState<IMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<IMenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const [formData, setFormData] = useState<Partial<IMenuItem>>({
    name: "",
    description: "",
    ingredients: "",
    price: 0,
    category: "",
    available: true,
    imageUrl: "",
    dietaryInfo: {
      vegetarian: false,
      vegan: false,
      gluten_free: false,
      halal: false,
    },
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${apiUrl}/api/menus/my-menu`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        // No menu exists yet
        setMenu(null);
      } else if (!response.ok) {
        throw new Error("Failed to fetch menu");
      } else {
        const data = await response.json();
        setMenu(data.menu);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name?.trim()) return "Name is required";
    if (!formData.ingredients?.trim()) return "Ingredients are required";
    if (!formData.price || formData.price <= 0)
      return "Price must be greater than 0";
    if (!formData.category) return "Category is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      let updatedMenuItems: IMenuItem[];

      if (editingItem) {
        // Update existing item
        updatedMenuItems = menu?.menuItems.map((item) =>
          item === editingItem ? { ...(formData as IMenuItem) } : item
        ) || [formData as IMenuItem];
      } else {
        // Add new item
        updatedMenuItems = [...(menu?.menuItems || []), formData as IMenuItem];
      }

      const response = await fetch(`${apiUrl}/api/menus`, {
        method: menu ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ menuItems: updatedMenuItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save menu item");
      }

      await fetchMenu();
      resetForm();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save menu item");
    }
  };

  const handleEdit = (item: IMenuItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowAddForm(true);
  };

  const handleDelete = async (itemToDelete: IMenuItem) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const updatedMenuItems =
        menu?.menuItems.filter((item) => item !== itemToDelete) || [];

      const response = await fetch(`${apiUrl}/api/menus`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ menuItems: updatedMenuItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete menu item");
      }

      await fetchMenu();
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete menu item"
      );
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      ingredients: "",
      price: 0,
      category: "",
      available: true,
      imageUrl: "",
      dietaryInfo: {
        vegetarian: false,
        vegan: false,
        gluten_free: false,
        halal: false,
      },
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className='container mx-auto p-6'>
        <div className='flex items-center justify-center'>
          <div className='text-lg'>Loading menu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <AdminNav></AdminNav>
      <Separator className='mt-5 mb-5' />
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Menu Management</h1>
          <p className='text-gray-600'>
            Manage your restaurant&apos;s menu items
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className='bg-green-600 hover:bg-green-700'
        >
          Add New Item
        </Button>
      </div>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {(showAddForm || editingItem) && (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>
              {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='name'>Name *</Label>
                  <Input
                    id='name'
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder='Item name'
                    required
                  />
                </div>
                <div>
                  <Label htmlFor='price'>Price *</Label>
                  <Input
                    id='price'
                    type='number'
                    step='0.01'
                    min='0'
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder='0.00'
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor='description'>Description</Label>
                <Input
                  id='description'
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder='Brief description of the item'
                />
              </div>

              <div>
                <Label htmlFor='ingredients'>Ingredients *</Label>
                <Input
                  id='ingredients'
                  value={formData.ingredients || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ingredients: e.target.value })
                  }
                  placeholder='List of ingredients'
                  required
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='category'>Category *</Label>
                  <Select
                    value={formData.category || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='imageUrl'>Image URL</Label>
                  <Input
                    id='imageUrl'
                    value={formData.imageUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder='https://example.com/image.jpg'
                  />
                </div>
              </div>

              <div>
                <Label>Dietary Information</Label>
                <div className='flex flex-wrap gap-4 mt-2'>
                  {Object.entries(formData.dietaryInfo || {}).map(
                    ([key, value]) => (
                      <label key={key} className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          checked={value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dietaryInfo: {
                                ...formData.dietaryInfo!,
                                [key]: e.target.checked,
                              },
                            })
                          }
                        />
                        <span className='capitalize'>
                          {key.replace("_", " ")}
                        </span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='available'
                  checked={formData.available}
                  onChange={(e) =>
                    setFormData({ ...formData, available: e.target.checked })
                  }
                />
                <Label htmlFor='available'>Available</Label>
              </div>

              <div className='flex space-x-2'>
                <Button type='submit' className='bg-blue-600 hover:bg-blue-700'>
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
                <Button type='button' variant='outline' onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className='grid gap-4'>
        {menu?.menuItems && menu.menuItems.length > 0 ? (
          menu.menuItems.map((item, index) => (
            <Card key={index}>
              <CardContent className='p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h3 className='text-lg font-semibold'>{item.name}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          item.available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                      <span className='px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs'>
                        {item.category}
                      </span>
                    </div>
                    <p className='text-gray-600 mb-2'>{item.description}</p>
                    <p className='text-sm text-gray-500 mb-2'>
                      <strong>Ingredients:</strong> {item.ingredients}
                    </p>
                    <div className='flex items-center gap-4'>
                      <span className='text-lg font-bold text-green-600'>
                        ${item.price.toFixed(2)}
                      </span>
                      {Object.entries(item.dietaryInfo).some(
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        ([_, value]) => value
                      ) && (
                        <div className='flex gap-1'>
                          {Object.entries(item.dietaryInfo).map(
                            ([key, value]) =>
                              value ? (
                                <span
                                  key={key}
                                  className='px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs'
                                >
                                  {key.replace("_", " ")}
                                </span>
                              ) : null
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className='flex space-x-2 ml-4'>
                    <Button
                      onClick={() => handleEdit(item)}
                      variant='outline'
                      size='sm'
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(item)}
                      variant='outline'
                      size='sm'
                      className='text-red-600 hover:text-red-800'
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className='p-8 text-center'>
              <p className='text-gray-500 mb-4'>No menu items found</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className='bg-green-600 hover:bg-green-700'
              >
                Add Your First Menu Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
