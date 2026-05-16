import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const parsePDFFile = async (file: File) => ({ content: [], cover: 'https://placeholder.com/150' });  
 