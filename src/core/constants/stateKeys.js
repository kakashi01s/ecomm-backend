// Centralized Global State Keys
// Using these constants ensures the backend and frontend stay perfectly synchronized 
// when managing SDUI reactivity via the `stac.setGlobalState` action.

export const StateKeys = {
  // Authentication & User
  IS_LOGGED_IN: "isLoggedIn",
  USER_NAME: "userName",
  USER_EMAIL: "userEmail",
  USER_ID: "userId",
  
  // Auth Form Errors
  AUTH_EMAIL_ERROR: "auth_email_error",
  AUTH_PASSWORD_ERROR: "auth_password_error",
  AUTH_OTP_ERROR: "auth_otp_error",

  // Commerce Context
  CART_COUNT: "cartCount",
  WISHLIST_COUNT: "wishlistCount",
  ACTIVE_PINCODE: "activePincode",
  DASHBOARD_TAB_INDEX: "dashboard_tab_index",

  // Dynamic Product Generation
  wishlistHeart: (productId) => `wishlist_${productId}`,
  cartQty: (productId) => `cart_qty_${productId}`,
};
