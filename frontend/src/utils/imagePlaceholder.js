/**
 * Standard category and brand box image mapping utility.
 * Ensures that whenever a product image fails to load or is empty,
 * it displays the correct hardware product type and brand box image.
 */

export const HARDWARE_BRAND_IMAGES = {
  // CPUs
  intel_cpu: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800',
  amd_cpu: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800',
  default_cpu: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800',

  // Motherboards
  motherboard: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  mainboard: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',

  // GPU / VGA
  gpu: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800',
  vga: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800',

  // RAM
  ram: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800',

  // SSD
  ssd: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800',

  // HDD
  hdd: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800',

  // PSU
  psu: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800',

  // Cooler
  cooler: 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=800',
  cpu_cooler: 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=800',

  // PC Case
  case: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800',

  // Fans
  fan: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800',
  case_fan: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800',

  // Monitor
  monitor: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',

  // Keyboard
  keyboard: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',

  // Mouse
  mouse: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800',

  // Headset
  headset: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',

  // Webcam
  webcam: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=800',

  // Prebuilt PC
  prebuilt_pc: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800',
  prebuilt: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800',

  // Laptop
  laptop: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800'
};

/**
 * Returns a guaranteed valid brand/category product image for any product
 * @param {object} product 
 * @returns {string} Image URL
 */
export const getProductFallbackImage = (product) => {
  if (!product) return HARDWARE_BRAND_IMAGES.case;

  const brand = String(product.brand || '').toLowerCase();
  const catSlug = String(
    product.category?.slug ||
    product.category?.builderComponentType ||
    product.builderComponentType ||
    product.categoryName ||
    ''
  ).toLowerCase();

  // CPU handling (Intel vs AMD)
  if (catSlug.includes('cpu')) {
    if (brand.includes('intel') || String(product.name || '').toLowerCase().includes('intel')) {
      return HARDWARE_BRAND_IMAGES.intel_cpu;
    }
    if (brand.includes('amd') || String(product.name || '').toLowerCase().includes('amd') || String(product.name || '').toLowerCase().includes('ryzen')) {
      return HARDWARE_BRAND_IMAGES.amd_cpu;
    }
    return HARDWARE_BRAND_IMAGES.default_cpu;
  }

  // Check matching category
  for (const [key, url] of Object.entries(HARDWARE_BRAND_IMAGES)) {
    if (catSlug === key || catSlug.includes(key)) {
      return url;
    }
  }

  // Prebuilt / Laptop by product type
  if (product.productType === 'PREBUILT_PC') return HARDWARE_BRAND_IMAGES.prebuilt_pc;
  if (product.productType === 'LAPTOP') return HARDWARE_BRAND_IMAGES.laptop;

  return HARDWARE_BRAND_IMAGES.case;
};
