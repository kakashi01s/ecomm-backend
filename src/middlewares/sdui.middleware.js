export const extractSduiContext = (req, res, next) => {
  // These headers come from your Flutter _HeadersInterceptor
  req.sdui = {
    platform: req.headers['platform'] || 'unknown',
    appVersion: req.headers['version'] || '1.0.0',
    theme: req.headers['theme-preference'] || 'light',
    isWeb: req.headers['platform'] === 'Web App',
    isMobile: ['Android App', 'iOS App'].includes(req.headers['platform'])
  };
  
  // Optional: Log the context during development
  console.log(`[SDUI] Request from ${req.sdui.platform} (v${req.sdui.appVersion})`);
  
  next();
};