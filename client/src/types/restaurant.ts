// types/restaurant.ts
export interface IRestaurant {
  _id: string;
  name: string;
  phone: string;
  location: {
    address: string;
    city: string;
    region: string;
    zip: string;
  };
  hours: {
    open: string;
    close: string;
  };
  rating?: number;
  ownerId: string;
  logoUrl?: string;
  qrCode?: string;
  createdAt?: string;
  updatedAt?: string;
}
