/**
 * Centralized API Endpoints for the SDUI Ecosystem.
 * Using these constants allows for easy API versioning and maintenance.
 */

const V1 = "";
const PREFIX = "/api";

export const API_VERSION = V1;

export const Endpoints = {
  // Auth
  AUTH: {
    BASE: `${V1}/auth`,
    BOOTSTRAP: `${V1}/auth/bootstrap`,
    ACTION: `${V1}/auth/action`,
    LOGOUT: `${V1}/auth/logout`,
  },

  // Dashboard
  DASHBOARD: {
    BASE: `${V1}/dashboard`,
    NEW_LAUNCHES: `${V1}/new-launches`,
    BESTSELLERS: `${V1}/bestsellers`,
    SETTINGS: `${V1}/settings`,
  },

  // Product
  PRODUCT: {
    BASE: `${V1}/product`,
    DETAILS: (id) => `${V1}/product/${id}`,
  },

  // Category
  CATEGORY: {
    BASE: `${V1}/categories`,
    PRODUCTS: (id) => `${V1}/categories/${id}/products`,
    FILTER: (id) => `${V1}/categories/${id}/products/filter`,
    FILTERS: (id) => `${V1}/categories/${id}/filters`,
  },

  // Cart
  CART: {
    BASE: `${V1}/cart`,
    ADD: `${V1}/cart/add`,
    UPDATE: `${V1}/cart/update`,
    ITEM: (id) => `${V1}/cart/${id}`,
  },

  // Wishlist
  WISHLIST: {
    BASE: `${V1}/wishlist`,
    TOGGLE: `${V1}/wishlist/toggle`,
    REMOVE: `${V1}/wishlist/remove`,
    MOVE_TO_CART: `${V1}/wishlist/move-to-cart`,
  },

  // Search
  SEARCH: {
    BASE: `${V1}/search`,
    LIVE: `${V1}/search/live`,
    SUGGESTIONS: `${V1}/search/suggestions`,
    RESULTS: (query = "") => `${V1}/search/results?q=${query}`,
  },

  // Profile
  PROFILE: {
    BASE: `${V1}/profile`,
    EDIT: `${V1}/profile/edit`,
    ADDRESSES: `${V1}/profile/addresses`,
    ADDRESS_ADD: `${V1}/profile/addresses/add`,
    ADDRESS_EDIT: (id) => `${V1}/profile/addresses/${id}/edit`,
    ADDRESS_DELETE: (id) => `${V1}/profile/addresses/${id}/delete`,
  },

  // Orders
  ORDERS: {
    BASE: `${V1}/orders`,
    DETAILS: (id) => `${V1}/orders/${id}`,
    CHECKOUT: `${V1}/checkout`,
  },

  // Utilities
  UTILITIES: {
    BASE: `${V1}/utilities`,
    PINCODE: `${V1}/utilities/pincode`,
    HELP: `${V1}/help`,
    ABOUT: `${V1}/about`,
  },

  // S3 / Media
  S3: {
    BASE: `${V1}/s3`,
  }
};

/**
 * Helper to get the full API path for mounting routes in app.js
 * e.g. getMountPath(Endpoints.AUTH.BASE) -> "/api/v1/auth"
 */
export const getMountPath = (endpointBase) => `${PREFIX}${endpointBase}`;
