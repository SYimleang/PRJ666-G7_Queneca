// types/restaurant.ts
export interface IWaitlistSettings {
  autoRemoveMinutes: number;
  maxCapacity: number;
  estimatedWaitTimePerCustomer: number;
  tableReadyNotificationMessage: string;
}

export interface IRestaurant {
  _id?: string;
  name: string;
  phone: string;
  location: {
    address: string;
    city: string;
    region: string;
    zip: string;
  };
  hours?: {
    day: string;
    open: string;
    close: string;
  }[]; // optional array of daily hours
  rating?: number;
  ownerId: string;
  logoUrl?: string;
  qrCode?: string;
  waitlistSettings: IWaitlistSettings;
  createdAt?: string;
  updatedAt?: string;
}
