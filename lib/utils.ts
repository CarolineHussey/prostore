import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//convert prisma object to javascript object
export function convertToPlainObject<T>(value: T) {
  return JSON.parse(JSON.stringify(value));
}
