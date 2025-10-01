import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//convert prisma object to javascript object
//<T> is a generic type that allows the function to accept any type of object. The return type (: T) is also the same type as the input (value: T), ensuring type safety.
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

//format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

//format errors
//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
  if (error.name === "ZodError") {
    //handle zod error

    return (
      JSON.parse(error.message)
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((err: any) => err.message)
        .join(". ")
    );
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    //handle prisma error
    const field = error.meta?.target ? error.meta.target[0] : "field";
    return `A record with this ${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists`;
  } else {
    //handle generic error
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message);
  }
}

//Round number to 2 decimal places
export function roundToTwoDecimalPlaces(value: number | string) {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("Value is not a number or string");
  }
}

//international currency converter
const CURRENCY_CONVERTER = new Intl.NumberFormat("en-GB", {
  currency: "GBP",
  style: "currency",
  minimumFractionDigits: 2,
});

//format currency
export function formatCurrency(amount: number | string | null) {
  if (typeof amount === "number") {
    return CURRENCY_CONVERTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_CONVERTER.format(Number(amount));
  } else {
    return "NaN";
  }
}
