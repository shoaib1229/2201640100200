export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  customShortCode?: string;
  createdAt: Date;
  expiryDate: Date;
  validityMinutes: number;
  clicks: ClickData[];
}

export interface ClickData {
  timestamp: Date;
  source: string;
  location: string;
}

const STORAGE_KEY = "affordmed_shortened_urls";
const BASE_URL = window.location.origin;

// Generate a random short code
export function generateShortCode(length: number = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate custom shortcode
export function isValidShortCode(shortCode: string): boolean {
  // Alphanumeric, reasonable length
  return /^[a-zA-Z0-9]{3,20}$/.test(shortCode);
}

// Check if shortcode is unique
export function isShortCodeUnique(shortCode: string): boolean {
  const existing = getShortenedUrls();
  return !existing.some(url => url.shortCode === shortCode);
}

// Get all shortened URLs from localStorage
export function getShortenedUrls(): ShortenedUrl[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      expiryDate: new Date(item.expiryDate),
      clicks: item.clicks.map((click: any) => ({
        ...click,
        timestamp: new Date(click.timestamp)
      }))
    }));
  } catch {
    return [];
  }
}

// Save shortened URLs to localStorage
export function saveShortenedUrls(urls: ShortenedUrl[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

// Create a new shortened URL
export function createShortenedUrl(
  originalUrl: string,
  customShortCode?: string,
  validityMinutes: number = 30
): ShortenedUrl | { error: string } {
  
  // Validate original URL
  if (!isValidUrl(originalUrl)) {
    return { error: "Please enter a valid URL (including http:// or https://)" };
  }

  // Generate or validate shortcode
  let shortCode: string;
  if (customShortCode) {
    if (!isValidShortCode(customShortCode)) {
      return { error: "Custom shortcode must be 3-20 alphanumeric characters" };
    }
    if (!isShortCodeUnique(customShortCode)) {
      return { error: "This shortcode is already taken. Please choose another one." };
    }
    shortCode = customShortCode;
  } else {
    // Generate unique shortcode
    do {
      shortCode = generateShortCode();
    } while (!isShortCodeUnique(shortCode));
  }

  const now = new Date();
  const expiryDate = new Date(now.getTime() + validityMinutes * 60 * 1000);

  const newUrl: ShortenedUrl = {
    id: crypto.randomUUID(),
    originalUrl,
    shortCode,
    customShortCode,
    createdAt: now,
    expiryDate,
    validityMinutes,
    clicks: []
  };

  const existing = getShortenedUrls();
  const updated = [...existing, newUrl];
  saveShortenedUrls(updated);

  return newUrl;
}

// Record a click on a shortened URL
export function recordClick(shortCode: string): void {
  const urls = getShortenedUrls();
  const urlIndex = urls.findIndex(url => url.shortCode === shortCode);
  
  if (urlIndex === -1) return;

  const clickData: ClickData = {
    timestamp: new Date(),
    source: document.referrer || "Direct",
    location: "Unknown" // In a real app, this would be geolocation
  };

  urls[urlIndex].clicks.push(clickData);
  saveShortenedUrls(urls);
}

// Get shortened URL by shortcode
export function getShortenedUrl(shortCode: string): ShortenedUrl | null {
  const urls = getShortenedUrls();
  return urls.find(url => url.shortCode === shortCode) || null;
}

// Check if URL is expired
export function isUrlExpired(url: ShortenedUrl): boolean {
  return new Date() > url.expiryDate;
}

// Get full shortened URL
export function getFullShortUrl(shortCode: string): string {
  return `${BASE_URL}/${shortCode}`;
}

// Clean up expired URLs
export function cleanupExpiredUrls(): void {
  const urls = getShortenedUrls();
  const validUrls = urls.filter(url => !isUrlExpired(url));
  saveShortenedUrls(validUrls);
}