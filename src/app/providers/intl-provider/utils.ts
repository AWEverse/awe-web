import { promises as fs } from 'fs';

/**
 * Gets the names of all JSON files in the specified directory.
 * @param dir - The directory to search for JSON files.
 * @returns A promise that resolves to an array of JSON file names.
 */
export async function getJsonFileNames(dir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dir);
    // Filter and return only .json file names
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
    throw error;
  }
}
