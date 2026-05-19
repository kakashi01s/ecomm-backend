/**
 * SDUI Configuration Constants
 * 
 * These define how the Flutter app's dynamic parser should treat specific JSON keys.
 */

export const SDUIConfig = {
    /**
     * Keys that should ALWAYS be converted to a String in the Flutter app's injectState method.
     * This prevents type cast errors when a placeholder resolves to an integer (like 0 or 1)
     * but the Flutter widget model expects a String (like in StacText or StacImage src).
     */
    stringTargetKeys: [
      'data',
      'hintText',
      'labelText',
      'src',
      'url',
      'icon',
      'mediaUrl',
      'thumbnail',
      'linkUrl',
      'count'
    ]
  };