// frontend/src/utils/imageUtils.js
// Helpers to resolve dish images, formats, and high-quality curated food presets

// Dynamic resolution for backend server URL matching current browser hostname
export const getBackendServerUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/api\/?$/, "");
  }
  if (typeof window !== "undefined" && window.location) {
    const host = window.location.hostname || "localhost";
    return `http://${host}:5000`;
  }
  return "http://localhost:5000";
};

export const BACKEND_SERVER_URL = getBackendServerUrl();

export const DEFAULT_FOOD_IMAGE =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80";

// Fallback images by dish name
export const KNOWN_DISH_IMAGES = {
  "butter chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80",
  "paneer butter masala": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
  "paneer tikka masala": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80",
  "dal makhani": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80",
  "biryani thali": "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80",
  "hara bhara kabab": "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&q=80",
  "samosa (2 pcs)": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  "samosa chaat platter": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  "masala chai": "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80",
  "mango lassi": "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&q=80",
  "mango saffron lassi": "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&q=80",
  "royal gulab jamun": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
  "gulab jamun": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
  "tandoori smoked wings": "https://images.unsplash.com/photo-1527477378408-1bc097b69b56?w=800&q=80",
  "tandoori wings": "https://images.unsplash.com/photo-1527477378408-1bc097b69b56?w=800&q=80"
};

// Fallback images by category
export const CATEGORY_FALLBACK_IMAGES = {
  "Main Course": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  Starters: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800&q=80",
  Appetizers: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800&q=80",
  Desserts: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
  Burgers: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  Pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
  Pasta: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
  Salads: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  Drinks: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80",
  Beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80"
};

// Curated presets for quick admin dish photo selection
export const CURATED_DISH_PRESETS = [
  {
    title: "Butter Chicken",
    category: "Main Course",
    url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80"
  },
  {
    title: "Paneer Tikka Masala",
    category: "Main Course",
    url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80"
  },
  {
    title: "Dal Makhani",
    category: "Main Course",
    url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80"
  },
  {
    title: "Royal Dum Biryani",
    category: "Main Course",
    url: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800&q=80"
  },
  {
    title: "Hara Bhara Kabab",
    category: "Starters",
    url: "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?w=800&q=80"
  },
  {
    title: "Crispy Samosa Platter",
    category: "Starters",
    url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80"
  },
  {
    title: "Smoky Tandoori Tikka",
    category: "Starters",
    url: "https://images.unsplash.com/photo-1527477378408-1bc097b69b56?w=800&q=80"
  },
  {
    title: "Spring Bruschetta & Rolls",
    category: "Appetizers",
    url: "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800&q=80"
  },
  {
    title: "Warm Royal Gulab Jamun",
    category: "Desserts",
    url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80"
  },
  {
    title: "Decadent Chocolate Cake",
    category: "Desserts",
    url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80"
  },
  {
    title: "Alphonso Mango Lassi",
    category: "Drinks",
    url: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&q=80"
  },
  {
    title: "Artisanal Gourmet Burger",
    category: "Main Course",
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80"
  },
  {
    title: "Woodfired Neapolitan Pizza",
    category: "Main Course",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80"
  },
  {
    title: "Creamy Truffle Pasta",
    category: "Main Course",
    url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80"
  },
  {
    title: "Mediterranean Green Salad",
    category: "Salads",
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80"
  }
];

/**
 * Resolves a food item image path to a displayable URL
 * @param {string|undefined} imagePath - image URL or relative uploaded path
 * @param {string} [name=""] - dish name for matching known presets
 * @param {string} [category=""] - category for matching category fallback
 * @returns {string} displayable image URL
 */
export function resolveDishImage(imagePath, name = "", category = "") {
  const trimmed = (imagePath || "").trim();

  // 1. Direct explicit image attached
  if (trimmed) {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
      return trimmed;
    }
    // Relative path uploaded to backend (e.g. /uploads/dish-xxx.jpg)
    const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    const serverUrl = getBackendServerUrl();
    return `${serverUrl}${cleanPath}`;
  }

  // 2. Name-based fallback
  const cleanName = (name || "").toLowerCase().trim();
  if (cleanName && KNOWN_DISH_IMAGES[cleanName]) {
    return KNOWN_DISH_IMAGES[cleanName];
  }

  // 3. Category-based fallback
  if (category && CATEGORY_FALLBACK_IMAGES[category]) {
    return CATEGORY_FALLBACK_IMAGES[category];
  }

  // 4. Default generic food image
  return DEFAULT_FOOD_IMAGE;
}
