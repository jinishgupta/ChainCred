import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format wallet address
export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format date from timestamp
export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

// Get share URL for credential
export function getShareUrl(credentialId) {
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseUrl}/verify/${credentialId}`;
}

// Validate Ethereum address
export function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Get credential status text
export function getCredentialStatus(credential) {
  if (!credential) return 'Unknown';
  if (credential.isRevoked) return 'Revoked';
  return 'Valid';
}

// Get credential status color
export function getCredentialStatusColor(credential) {
  if (!credential) return 'gray';
  if (credential.isRevoked) return 'red';
  return 'green';
}

// Format large numbers
export function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

// Truncate text
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Get degree types for dropdown
export const DEGREE_TYPES = [
  'Bachelor of Science',
  'Bachelor of Arts',
  'Master of Science',
  'Master of Arts',
  'Master of Business Administration',
  'Doctor of Philosophy',
  'Associate Degree',
  'Diploma',
  'Certificate',
];

// Get major fields for dropdown
export const MAJOR_FIELDS = [
  'Computer Science',
  'Business Administration',
  'Engineering',
  'Medicine',
  'Law',
  'Economics',
  'Psychology',
  'Biology',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Literature',
  'History',
  'Political Science',
  'Architecture',
  'Design',
  'Marketing',
  'Finance',
  'Accounting',
  'Data Science',
  'Artificial Intelligence',
  'Other',
];
