import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "query-string";

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

//shorten the uuid to last 6 characters
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

//format date and time
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

//form the pagination links
export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string; //the target query param (page)
  value: string | null; //the value of the query param from the clickHandler (the page number we want to go to)
}) {
  const query = qs.parse(params); //returns current query params
  query[key] = value; //sets the value to the page we want to go to (from clickHandler)

  //stringifies the url from the pathname and the query obrained from qs.parse()
  return qs.stringifyUrl(
    { url: window.location.pathname, query },
    { skipNull: true }
  );
}
