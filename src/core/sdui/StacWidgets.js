export const stac = {
  // ==========================================
  // 1. STYLING HELPERS (The Customisation)
  // ==========================================
  textStyle: ({ fontSize, fontWeight, color, letterSpacing } = {}) => ({
    fontSize, fontWeight, color, letterSpacing
  }),

  boxDecoration: ({ color, borderRadius, border } = {}) => ({
    color, borderRadius, border        
  }),

  // ==========================================
  // 2. LAYOUTS & CONTAINERS
  // ==========================================
  scaffold: ({ appBar, body, backgroundColor, bottomNavigationBar, floatingActionButton, drawer } = {}) => ({
    type: "scaffold",
    backgroundColor,
    appBar,
    body,
    bottomNavigationBar,
    floatingActionButton,
    drawer 
  }),

  appBar: ({ title, backgroundColor, elevation, centerTitle = true, leading, actions } = {}) => ({
    type: "appBar",
    title: typeof title === 'string' ? stac.text(title, { style: stac.textStyle({ fontSize: 20, fontWeight: "bold" }) }) : title,
    backgroundColor, elevation, centerTitle, leading, actions
  }),

  safeArea: ({ child }) => ({ type: "safeArea", child }),

  singleChildScrollView: ({ child, padding, scrollDirection } = {}) => ({ 
    type: "singleChildScrollView", 
    padding, 
    scrollDirection, 
    child 
  }),

  listView: ({ children, padding, shrinkWrap = false } = {}) => ({
    type: "listView", padding, shrinkWrap, children: children || []
  }),

  column: ({ children, mainAxisAlignment, crossAxisAlignment, mainAxisSize } = {}) => ({
    type: "column",
    mainAxisAlignment: mainAxisAlignment || "start",
    crossAxisAlignment: crossAxisAlignment || "center",
    mainAxisSize: mainAxisSize || "max",
    children: children || []
  }),

  row: ({ children, mainAxisAlignment, crossAxisAlignment, mainAxisSize } = {}) => ({
    type: "row",
    mainAxisAlignment: mainAxisAlignment || "start",
    crossAxisAlignment: crossAxisAlignment || "center",
    mainAxisSize: mainAxisSize || "max",
    children: children || []
  }),

  expanded: ({ child, flex = 1 }) => ({ type: "expanded", flex, child }),

  center: ({ child }) => ({ type: "center", child }),

  padding: ({ all, vertical, horizontal, top, bottom, left, right, child }) => {
    let p = [0, 0, 0, 0]; 
    if (all !== undefined) {
      p = [all, all, all, all];
    } else if (vertical !== undefined || horizontal !== undefined) {
      p = [horizontal || 0, vertical || 0, horizontal || 0, vertical || 0];
    } else {
      p = [left || 0, top || 0, right || 0, bottom || 0];
    }
    return { type: "padding", padding: p, child };
  },

  container: ({ width, height, padding, margin, decoration, color, child } = {}) => ({
    type: "container", width, height, padding, margin, decoration, color, child
  }),

  sizedBox: ({ width, height, child } = {}) => ({ type: "sizedBox", width, height, child }),

  card: ({ child, color, elevation, margin, shape }) => ({
    type: "card", color, elevation, margin, shape, child
  }),

  divider: ({ color, height, thickness } = {}) => ({
    type: "divider", color, height, thickness
  }),

  // ==========================================
  // 3. UI ELEMENTS & INPUTS
  // ==========================================
  text: (text, { style, textAlign, maxLines, overflow } = {}) => ({
    type: "text", data: text, style, textAlign, maxLines, overflow 
  }),

image: ({ src, imageType = "network", color, width, height, fit = "cover" }) => ({
    type: "image", 
    imageType: imageType, 
    src, 
    color, 
    width, 
    height, 
    fit 
  }),
  icon: ({ icon, color, size }) => ({
    type: "icon", icon, color, size
  }),

  circularProgressIndicator: ({ color } = {}) => ({ type: "circularProgressIndicator", color }),

  button: ({ text, action, style, color, textColor } = {}) => ({
    type: "elevatedButton",
    child: stac.text(text, { style: stac.textStyle({ color: textColor }) }),
    onPressed: action,
    style: style || { backgroundColor: color } 
  }),

  textField: ({ id, hintText, labelText, obscureText, keyboardType, prefixIcon, validators } = {}) => ({
    type: "textFormField",
    id,
    decoration: {
      hintText, labelText,
      prefixIcon: prefixIcon ? { type: "icon", icon: prefixIcon } : undefined,
      border: { type: "outlineInputBorder" }
    },
    obscureText: obscureText || false,
    keyboardType,
    validators: validators || [] 
  }),

  checkbox: ({ id, title, value = false, activeColor } = {}) => ({
    type: "checkboxListTile", id, title: stac.text(title), value, activeColor
  }),

  // ==========================================
  // 4. SDUI ACTIONS
  // ==========================================
  navigate: (url, action = "push", ui = null) => ({ actionType: "server_navigate", url, action, ui }),

  manageSession: (sessionAction, tokens, nextAction) => ({
    actionType: "manage_session", sessionAction, accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken, nextAction
  }),

  showSnackbar: (message) => ({ actionType: "show_snackbar", message }),

  showToast: (message, { backgroundColor, textColor, fontSize, gravity, nextAction } = {}) => ({
    actionType: "show_toast", message, backgroundColor, textColor, fontSize, gravity, nextAction
  }),

  apiRequest: ({ url, method = "POST", body, onSuccess, onError }) => ({
    actionType: "api_request", url, method, body, onSuccess, onError
  }),

  form: ({ child }) => ({ type: "form", child }),

  // ==========================================
  // 5. RESPONSIVE FRAMEWORK HELPERS
  // ==========================================
  
  responsiveVisibility: ({ hiddenWhen = [], visibleWhen = [], child }) => ({
    type: "responsive_visibility",
    hiddenWhen, 
    visibleWhen, 
    child
  }),

  responsiveRowColumn: ({ isRow = true, children = [] }) => ({
    type: "responsive_row_column",
    isRow, 
    children
  }),

  gridView: ({ children, crossAxisCount = 2, mainAxisSpacing = 16, crossAxisSpacing = 16, childAspectRatio = 0.75, padding, shrinkWrap = false, physics } = {}) => ({
    type: "gridView",
    crossAxisCount, 
    mainAxisSpacing, 
    crossAxisSpacing, 
    childAspectRatio, 
    padding,
    shrinkWrap, 
    physics,    
    children: children || []
  }),

  stack: ({ children, alignment = "topLeft" }) => ({
    type: "stack", alignment, children: children || []
  }),

  positioned: ({ top, bottom, left, right, child }) => ({
    type: "positioned", top, bottom, left, right, child
  }),

  clipRRect: ({ borderRadius, child }) => ({
    type: "clipRRect", borderRadius, child
  }),

  inkWell: ({ action, child }) => ({
    type: "inkWell", onTap: action, child
  }),
  defaultBottomNavigationController: ({ length, initialIndex = 0, child }) => ({
    type: "defaultBottomNavigationController",
    length,
    initialIndex,
    child
  }),
  // Add to 2. LAYOUTS & CONTAINERS
  bottomNavigationBar: ({ items, backgroundColor, selectedItemColor, unselectedItemColor }) => ({
    type: "bottomNavigationBar",
    backgroundColor, selectedItemColor, unselectedItemColor,
    items: items || []
  }),

  bottomNavigationBarItem: ({ icon, label }) => ({
    icon: { type: "icon", icon },
    label
  }),

showDialog: (widget) => ({ 
    actionType: "showDialog", // camelCase exactly as defined in Stac v1.4.0
    widget // mapped to "widget" key
  }),

  showBottomSheet: (widget) => ({ 
    actionType: "showModalBottomSheet", // camelCase exactly as defined in Stac v1.4.0
    widget // mapped to "widget" key
  }),
  customScrollView: ({ slivers, physics } = {}) => ({
    type: "customScrollView",
    physics,
    slivers: slivers || []
  }),

  sliverAppBar: ({ title, backgroundColor, pinned = true, floating = false, expandedHeight, flexibleSpace, leading, actions }) => ({
    type: "sliverAppBar",
    title: typeof title === 'string' ? stac.text(title, { style: stac.textStyle({ color: "#FFFFFF", fontWeight: "bold" }) }) : title,
    backgroundColor,
    pinned,
    floating,
    expandedHeight,
    flexibleSpace,
    leading,
    actions
  }),

  flexibleSpaceBar: ({ background, title, centerTitle = false, collapseMode = "parallax" }) => ({
    type: "flexibleSpaceBar",
    background,
    title,
    centerTitle,
    collapseMode
  }),

  sliverToBoxAdapter: ({ child }) => ({
    type: "sliverToBoxAdapter",
    child
  }),

  // Add to 3. UI ELEMENTS & INPUTS
  
  // HERO ANIMATION: Animates a widget seamlessly between two different screens!
  hero: ({ tag, child }) => ({
    type: "hero",
    tag, // Must be unique and match exactly on both screens!
    child
  }),
  svg: ({ src, isNetwork = false, color, width, height, rotationDegrees = 0 }) => ({
    type: "svg_asset",
    src,              // Either the AppIcon constant OR a full "https://..." URL
    isNetwork,        // Boolean flag
    color,            // Hex string (e.g., "#FF5722")
    width,
    height,
    rotationDegrees   // Accepts 0-360 degrees for easy server-side rotation
  }),
  video: ({ src, autoPlay = true, loop = true, muted = true, showControls = false, width, height, fit = "cover" }) => ({
    type: "video",
    src,
    autoPlay,
    loop,
    muted,
    showControls,
    width,
    height,
    fit
  }),
};