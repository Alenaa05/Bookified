import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const parsePDFFile = async (file: File) => {
  if (typeof window === "undefined") {
    return { content: [], cover: '/assets/book.png' };
  }

  try {
    const pdfjsLib = await import("pdfjs-dist");
    
    // Set the worker source pointing to CDN to avoid bundler issues
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const content: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      
      if (pageText) {
        content.push(pageText);
      }
    }

    return {
      content,
      cover: '/assets/book.png'
    };
  } catch (error) {
    console.error("Error parsing PDF: ", error);
    return { content: [], cover: '/assets/book.png' };
  }
};

export function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function serializeData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
 