import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
// enables conditional classnames
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
