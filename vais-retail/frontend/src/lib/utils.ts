import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function assertEnv(
  key: string,
  message = `Missing environment variable: ${key}`
): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(message);
  }
  return value;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function replaceLogoUrl(url?: string | null) {
  if (!url) return "";

  const token = process.env.NEXT_PUBLIC_LOGO_DEV_KEY ?? "";
  const urlObj = new URL(url);
  urlObj.hostname = "img.logo.dev";
  urlObj.searchParams.append("token", token);
  return urlObj.toString();
}
