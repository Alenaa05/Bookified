import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { voiceOptions, DEFAULT_VOICE } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Maps voice key, voice ID, or voice name to the corresponding ElevenLabs voice object
export const getVoice = (voiceKeyOrId?: string) => {
  if (!voiceKeyOrId) {
    return voiceOptions[DEFAULT_VOICE as keyof typeof voiceOptions] || voiceOptions.rachel;
  }

  const normalized = voiceKeyOrId.toLowerCase();

  // 1. Try to look it up as a direct key of voiceOptions (e.g., "rachel", "daniel")
  const key = normalized as keyof typeof voiceOptions;
  if (voiceOptions[key]) {
    return voiceOptions[key];
  }

  // 2. Try to find it by voice ID (e.g., "21m00Tcm4TlvDq8ikWAM")
  const optionById = Object.values(voiceOptions).find(
    (option) => option.id === voiceKeyOrId
  );
  if (optionById) {
    return optionById;
  }

  // 3. Try to find it by case-insensitive name (e.g., "Rachel")
  const optionByName = Object.values(voiceOptions).find(
    (option) => option.name.toLowerCase() === normalized
  );
  if (optionByName) {
    return optionByName;
  }

  // Fallback to default voice if nothing matches
  return voiceOptions[DEFAULT_VOICE as keyof typeof voiceOptions] || voiceOptions.rachel;
};

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

    // Try to dynamically extract and render the first page of the PDF as the cover image
    let cover = '/assets/book.png';
    try {
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await firstPage.render({ canvasContext: context, viewport }).promise;
        cover = canvas.toDataURL('image/png');
      }
    } catch (coverError) {
      console.error("Failed to render PDF cover page dynamically:", coverError);
    }

    return {
      content,
      cover
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