export interface IMenuItem {
  _id?: string;
  name: string;
  description: string;
  ingredients: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
  dietaryInfo: {
    vegetarian: boolean;
    vegan: boolean;
    gluten_free: boolean;
    halal: boolean;
  };
  promotions?: {
    discountPercentage: number;
    validUntil: Date;
  };
}

export interface IMenu {
  _id: string;
  restaurantId: string;
  menuItems: IMenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IWaitlistSettings {
  autoRemoveMinutes: number;
  maxCapacity: number;
  estimatedWaitTimePerCustomer: number;
  tableReadyNotificationMessage: string;
}
