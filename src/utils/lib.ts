import getColors from "get-image-colors";

export function getWeekNumber(date: Date): number {
  // Copy the input date to avoid modifying the original
  const d = new Date(date);

  // Set the date to the first day of the year
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));

  // Get the first day of the year
  const yearStart = new Date(d.getFullYear(), 0, 1);

  // Calculate the number of days between the given date and the start of the year
  const dayOfYear = Math.floor((d.getTime() - yearStart.getTime()) / 86400000);

  // Calculate the week number
  const weekNumber = Math.ceil((dayOfYear + 1) / 7);

  return weekNumber;
}

/**
 * Generates a gradient color from a seed string (BackupId)
 * @param seed A string to generate a gradient from
 */
export const generateGradient = (seed: string) => {
  // Generate a hash from the seed string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate gradient parameters based on the hash
  const direction = hash % 360;
  const positionX = (hash >> 8) % 100;
  const positionY = (hash >> 16) % 100;
  const angle = (hash >> 24) % 360;

  // Generate multiple hue values based on the hash
  const hueStep = 60;
  const hue1 = hash % 360;
  const hue2 = (hue1 + hueStep) % 360;
  const hue3 = (hue2 + hueStep) % 360;
  const hue4 = (hue3 + hueStep) % 360;

  // Determine the gradient type based on the hash
  const gradientType = hash % 4;

  // Generate the gradient string based on the gradient type
  switch (gradientType) {
    case 0:
      // Linear gradient
      return `linear-gradient(${direction}deg, hsl(${hue1}, 100%, 50%), hsl(${hue2}, 100%, 50%), hsl(${hue3}, 100%, 50%), hsl(${hue4}, 100%, 50%))`;
    case 1:
      // Radial gradient
      return `radial-gradient(circle at ${positionX}% ${positionY}%, hsl(${hue1}, 100%, 50%), hsl(${hue2}, 100%, 50%), hsl(${hue3}, 100%, 50%), hsl(${hue4}, 100%, 50%))`;
    case 2:
      // Conic gradient with smoother transitions
      return `conic-gradient(from ${angle}deg, hsl(${hue1}, 100%, 50%) 0deg, hsl(${hue1}, 100%, 50%) 60deg, hsl(${hue2}, 100%, 50%) 120deg, hsl(${hue2}, 100%, 50%) 180deg, hsl(${hue3}, 100%, 50%) 240deg, hsl(${hue3}, 100%, 50%) 300deg, hsl(${hue4}, 100%, 50%) 360deg)`;
    case 3:
      // Repeating linear gradient with smoother transitions
      return `repeating-linear-gradient(${direction}deg, hsl(${hue1}, 100%, 50%) 0%, hsl(${hue1}, 100%, 70%) 10%, hsl(${hue2}, 100%, 50%) 20%, hsl(${hue2}, 100%, 70%) 30%, hsl(${hue3}, 100%, 50%) 40%, hsl(${hue3}, 100%, 70%) 50%, hsl(${hue4}, 100%, 50%) 60%, hsl(${hue4}, 100%, 70%) 70%, hsl(${hue1}, 100%, 50%) 80%)`;
    default:
      // Fallback to linear gradient
      return `linear-gradient(${direction}deg, hsl(${hue1}, 100%, 50%), hsl(${hue2}, 100%, 50%), hsl(${hue3}, 100%, 50%), hsl(${hue4}, 100%, 50%))`;
  }
};

export const getImageColours = async (url: string, numColors = 5) => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return getColors(buffer, {
      count: numColors,
      type: `image/jpeg`,
    });
  } catch (error) {
    console.error("Error getting image colors:", error);
    throw error;
  }
};

/**
 * Calculate a good alpha value by how bright the color is
 * @param hex The input hex color
 * @returns An appropriate alpha value
 */
export function calculateAlpha(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return Math.min(1.3 - (r * 0.299 + g * 0.587 + b * 0.114) / 255, 1);
}

export function hexToRGBA(hex: string | undefined, alpha?: number) {
  if (!hex) return "#121212";

  if (!alpha) {
    alpha = calculateAlpha(hex);
  }

  console.log(alpha);

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
