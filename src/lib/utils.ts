import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with Tailwind Merge for better performance
 * and class name prioritization.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchCsvData(url: string) {
  try {
    // Add cache-buster to ensure fresh data
    const cacheBuster = `?t=${Date.now()}`;
    const response = await fetch(url + cacheBuster);
    if (!response.ok) throw new Error('Network response was not ok');
    const text = await response.text();
    const [headerLine, ...lines] = text.split('\n');
    if (!headerLine) return [];
    
    const headers = headerLine.split(',').map(h => h.trim());
    
    // Improved CSV parsing to handle potential quotes or complex fields
    const parseCsvLine = (line: string) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    return lines
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = parseCsvLine(line);
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {} as any);
      });
  } catch (error) {
    console.error("Error fetching CSV:", error);
    return [];
  }
}
