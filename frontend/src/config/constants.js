// frontend/src/config/constants.js
// Centralized constants for role-based filtering and school configuration

// Helper to normalize names for case-insensitive comparisons
export const normalizeName = (s) => (s || '').toString().trim().toUpperCase();

// Allowed subjects for Wali Kelas role/views
export const ALLOWED_MAPEL_WALI = [
  'BAHASA INDONESIA',
  'CITIZENSHIP',
  'IPAS',
  'LIFE SKILLS',
  // Some datasets may use Greek characters for MATEMATIKA; include both variants
  'ΜΑΤΕΜΑΤΙΚΑ',
  'MATEMATIKA',
];

// Official class names in the school
export const SCHOOL_CLASSES = [
  '1 Gumujeng',
  '1 Someah',
  '1 Darehdeh',
  '2 Gentur',
  '2 Rancage',
  '2 Daria',
  '3 Calakan',
  '3 Singer',
  '3 Rancingeus',
  '4 Jatmika',
  '4 Gumanti',
  '4 Marahmay',
  '5 Rucita',
  '5 Binangkit',
  '5 Macakal',
  '6 Gumilang',
  '6 Sonagar',
  '6 Parigel',
];
