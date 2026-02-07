import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(time: string): string {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getTimeRemaining(targetDate: string, targetTime: string): string {
  const target = new Date(`${targetDate}T${targetTime}`);
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return 'Started';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function canRequestAgain(lastRequestTime: string, hours: number): boolean {
  const lastRequest = new Date(lastRequestTime);
  const now = new Date();
  const diff = now.getTime() - lastRequest.getTime();
  const hoursDiff = diff / (1000 * 60 * 60);
  return hoursDiff >= hours;
}

export function getTimeUntilNextRequest(lastRequestTime: string, hours: number): string {
  const lastRequest = new Date(lastRequestTime);
  const nextRequest = new Date(lastRequest.getTime() + hours * 60 * 60 * 1000);
  const now = new Date();
  const diff = nextRequest.getTime() - now.getTime();

  if (diff <= 0) return 'Now';

  const remainingHours = Math.floor(diff / (1000 * 60 * 60));
  const remainingMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const remainingSeconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${remainingHours}h ${remainingMinutes}m ${remainingSeconds}s`;
}
