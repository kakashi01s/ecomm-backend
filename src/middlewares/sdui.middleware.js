export const extractSduiContext = (req, res, next) => {
  // 1. Read the exact headers sent by the Flutter _HeadersInterceptor
  const rawDeviceType = req.headers['x-device-type'] || 'mobile';
  const platformHeader = req.headers['platform'] || 'unknown';

  // 2. Build the centralized SDUI context object
  req.sdui = {
    // Core details
    platform: platformHeader,
    appVersion: req.headers['version'] || '1.0.0',
    theme: req.headers['theme-preference'] || 'light',
    
    // ── LAYOUT FLAGS (Based strictly on screen width) ──
    // Determines grid counts, carousel types, and bottom nav vs side nav
    deviceType: rawDeviceType,
    isMobile: rawDeviceType === 'mobile',
    isTablet: rawDeviceType === 'tablet',
    isDesktop: rawDeviceType === 'desktop',
    
    // ── PLATFORM FLAGS (Based strictly on operating system) ──
    // Determines native integrations (e.g., Apple Pay vs Google Pay, or hiding web-incompatible plugins)
    isWeb: platformHeader === 'web',
    isAndroid: platformHeader === 'android',
    isIos: platformHeader === 'ios',
    isMacOs: platformHeader === 'macos',
    isWindows: platformHeader === 'windows',
    isLinux: platformHeader === 'linux'
  };
  
  // Backward compatibility just in case older routes expect req.deviceType directly
  req.deviceType = rawDeviceType;
  
  // Optional: Log the incoming context to help debug layouts
  console.log(`[SDUI] App: ${req.sdui.platform} | Layout: ${req.sdui.deviceType}`);
  
  next();
};