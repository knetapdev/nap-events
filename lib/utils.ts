import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateQRCode(): string {
  return uuidv4();
}

export async function generateQRCodeImage(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateShareableCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

export function parseQueryParams(url: URL) {
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const sort = url.searchParams.get('sort') || '-createdAt';
  const search = url.searchParams.get('search') || '';

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
    sort,
    search,
    skip: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit)),
  };
}
