/**
 * Helper to display category slugs/codes in standard UPPERCASE format
 * e.g. cpu -> CPU, gpu -> GPU, ram -> RAM, ssd -> SSD, hdd -> HDD,
 *      psu -> PSU, case -> CASE, mainboard -> MOTHERBOARD, monitor -> MONITOR
 */

const UPPERCASE_SLUG_MAP = {
  cpu: 'CPU',
  gpu: 'GPU',
  ram: 'RAM',
  ssd: 'SSD',
  hdd: 'HDD',
  psu: 'PSU',
  case: 'CASE',
  mainboard: 'MOTHERBOARD',
  motherboard: 'MOTHERBOARD',
  monitor: 'MONITOR',
  cooler: 'COOLER',
  cpu_cooler: 'COOLER',
  fan: 'FAN',
  case_fan: 'FAN',
  keyboard: 'KEYBOARD',
  mouse: 'MOUSE',
  headset: 'HEADSET',
  webcam: 'WEBCAM'
};

/**
 * Returns the uppercase representation of a category slug/code
 * @param {string} slugOrCode 
 * @returns {string}
 */
export const formatCategorySlug = (slugOrCode) => {
  if (!slugOrCode) return '';
  const key = String(slugOrCode).trim().toLowerCase();
  if (UPPERCASE_SLUG_MAP[key]) {
    return UPPERCASE_SLUG_MAP[key];
  }
  return String(slugOrCode).toUpperCase();
};

/**
 * Formats a category name if it matches a hardware slug
 * @param {object} category 
 * @returns {string}
 */
export const formatCategoryDisplay = (category) => {
  if (!category) return '';
  const slug = category.slug || category.builderComponentType || '';
  const formattedCode = formatCategorySlug(slug);
  return formattedCode || category.name || '';
};
