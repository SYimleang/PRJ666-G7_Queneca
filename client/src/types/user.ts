// types/user.ts
export interface IUser {
  _id?: string;
  email: string;
  role: string;
  token: string;
  name: string;
  phone: string;
  restaurantId?: string;
}
