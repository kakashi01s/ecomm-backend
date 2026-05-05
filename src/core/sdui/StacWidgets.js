export const stac = {
  // ==========================================
  // 1. STYLING HELPERS
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

  // Web-compatible horizontal scroll — wraps in a ScrollConfiguration that 
  // enables drag scrolling on web (pointer devices)
  webScrollRow: ({ children, padding } = {}) => ({
    type: "webScrollRow",
    padding,
    children: children || []
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

image: ({ src, imageType = "network", color, width, height, fit = "cover", errorWidget }) => ({
    type: "image", 
    imageType: imageType, 
    src, color, width, height, fit,
    errorWidget // <-- ADD THIS
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

  textFormField: ({ id, hintText, labelText, obscureText, keyboardType, prefixIcon, suffixIcon, validators, decoration } = {}) => ({
    type: "textFormField",
    id,
    decoration: decoration || {
      hintText, labelText,
      prefixIcon: prefixIcon ? (typeof prefixIcon === 'string' ? { type: "icon", icon: prefixIcon } : prefixIcon) : undefined,
      suffixIcon: suffixIcon ? (typeof suffixIcon === 'string' ? { type: "icon", icon: suffixIcon } : suffixIcon) : undefined,
      border: { type: "outlineInputBorder" }
    },
    obscureText: obscureText || false,
    keyboardType,
    validators: validators || [] 
  }),

textField: ({ 
    id, 
    hintText, 
    labelText, 
    obscureText, 
    keyboardType, 
    prefixIcon, 
    suffixIcon, 
    validators, 
    decoration, 
    autofocus, 
    onChanged,     // <-- ADD THIS
    onSubmitted    // <-- ADD THIS
  } = {}) => ({
    type: "textField",
    id,
    decoration: decoration || {
      hintText, labelText,
      prefixIcon: prefixIcon ? (typeof prefixIcon === 'string' ? { type: "icon", icon: prefixIcon } : prefixIcon) : undefined,
      suffixIcon: suffixIcon ? (typeof suffixIcon === 'string' ? { type: "icon", icon: suffixIcon } : suffixIcon) : undefined,
      border: { type: "outlineInputBorder" }
    },
    obscureText: obscureText || false,
    keyboardType,
    validators: validators || [],
    autofocus: autofocus || false,
    onChanged,     // <-- PASS TO JSON
    onSubmitted    // <-- PASS TO JSON
  }),

  checkbox: ({ id, title, value = false, activeColor } = {}) => ({
    type: "checkboxListTile", id, title: stac.text(title), value, activeColor
  }),

  // ==========================================
  // 4. SDUI ACTIONS
  // ==========================================
navigate: (url, action = "push", ui = null, loadingUi = null) => ({
    actionType: "server_navigate", 
    url, 
    action, 
    ui,
    loadingUi: loadingUi || {
      type: "scaffold",
      backgroundColor: "#F8F9FA",
      body: {
        type: "center",
        child: { 
          type: "circularProgressIndicator", 
          color: "#FF5722" 
        }
      }
    }
  }),
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
    hiddenWhen, visibleWhen, child
  }),

  gridView: ({ children, crossAxisCount = 2, mainAxisSpacing = 16, crossAxisSpacing = 16, childAspectRatio = 0.75, padding, shrinkWrap = false, physics } = {}) => ({
    type: "gridView",
    crossAxisCount, mainAxisSpacing, crossAxisSpacing, childAspectRatio, 
    padding, shrinkWrap, physics,    
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
  asyncButton: ({ action, loadingColor, child }) => ({

    type: "async_button",
    action,
    loadingColor,
    child
  }),

  defaultBottomNavigationController: ({ length, initialIndex = 0, child }) => ({
    type: "defaultBottomNavigationController",
    length, initialIndex, child
  }),

bottomNavigationBar: ({ 
    items, 
    backgroundColor, 
    selectedItemColor, 
    unselectedItemColor,
    elevation = 0, // Default to 0 so we can use a custom shadow
    type = "fixed", // "fixed" looks much better than "shifting"
    showSelectedLabels = true,
    showUnselectedLabels = false // Hide inactive text for a cleaner look
  }) => ({
    type: "bottomNavigationBar",
    backgroundColor, 
    selectedItemColor, 
    unselectedItemColor,
    elevation,
    bottomNavigationBarType: type, 
    showSelectedLabels,
    showUnselectedLabels,
    items: items || []
  }),

  bottomNavigationBarItem: ({ icon, label }) => ({
    icon: { type: "icon", icon },
    label
  }),

  showDialog: (widget) => ({ actionType: "showDialog", widget }),

  showBottomSheet: (widget) => ({ actionType: "showModalBottomSheet", widget }),

  customScrollView: ({ slivers, physics } = {}) => ({
    type: "customScrollView",
    physics,
    slivers: slivers || []
  }),

sliverAppBar: ({ 
    title, 
    backgroundColor, 
    pinned = true, 
    floating = false, 
    primary,             // <-- Added primary
    toolbarHeight,       // <-- Added toolbarHeight
    expandedHeight, 
    flexibleSpace, 
    leading, 
    actions, 
    elevation, 
    centerTitle,
    automaticallyImplyLeading 
  } = {}) => ({
    type: "sliverAppBar",
    automaticallyImplyLeading,
    title: typeof title === 'string' ? stac.text(title, { style: stac.textStyle({ color: "#FFFFFF", fontWeight: "bold" }) }) : title,
    backgroundColor, 
    pinned, 
    floating, 
    primary,             // <-- Passed to JSON
    toolbarHeight,       // <-- Passed to JSON
    expandedHeight, 
    flexibleSpace, 
    leading, 
    actions, 
    elevation, 
    centerTitle
  }),

  flexibleSpaceBar: ({ background, title, centerTitle = false, collapseMode = "parallax" }) => ({
    type: "flexibleSpaceBar",
    background, title, centerTitle, collapseMode
  }),

  sliverToBoxAdapter: ({ child }) => ({
    type: "sliverToBoxAdapter", child
  }),

  hero: ({ tag, child }) => ({
    type: "hero", tag, child
  }),

  svg: ({ src, isNetwork = false, color, width, height, rotationDegrees = 0 }) => ({
    type: "svg_asset",
    src, isNetwork, color, width, height, rotationDegrees
  }),

  // ─────────────────────────────────────────────────────────────────
  // badge
  //
  // Overlays a small pill counter on top of any child widget.
  //
  // count        — integer. Badge is hidden when count === 0.
  // color        — badge background (defaults to Brand red / error)
  // textColor    — badge label color (defaults to white)
  // size         — diameter of the badge circle (default 16)
  // position     — { top, right, bottom, left } offsets inside the stack
  //                Defaults to top-right corner: { top: 0, right: 0 }
  //
  // Flutter renderer: wraps child in a Stack + Positioned badge container.
  // The badge is intentionally clipped slightly outside the icon bounds
  // for the standard iOS/Android badge look.
  // ─────────────────────────────────────────────────────────────────
  badge: ({
    child,
    count = 0,
    color = "#D32F2F",
    textColor = "#FFFFFF",
    size = 16,
    position = { top: 0, right: 0 },
  }) => ({
    type: "badge",
    count,
    color,
    textColor,
    size,
    position,
    child,
  }),

  video: ({ src, autoPlay = true, loop = true, muted = true, showControls = false, width, height, fit = "cover" }) => ({
    type: "video",
    src, autoPlay, loop, muted, showControls, width, height, fit
  }),

  // ==========================================
  // 6. CAROUSEL
  // Banner carousel with auto-scroll + dot indicators
  // ==========================================
  carousel: ({ items, height = 180, autoPlayIntervalSeconds = 4, borderRadius = 16 } = {}) => ({
    type: "carousel",
    height,
    autoPlayIntervalSeconds,
    borderRadius,
    items: items || []
  }),
  popThen: (nextAction) => ({
  actionType: "server_navigate",
  action: "pop",
  nextAction,  // <-- you'll need to handle this in NavigationActionParser
  }),
  keyboardAvoiding: ({ child }) => ({
  type: "keyboardAvoiding",
  child,
}),
showBottomSheet: (widget, { isScrollControlled = true } = {}) => ({ 
  actionType: "showModalBottomSheet", 
  widget,
  isScrollControlled,
}),
wishlistHeart: ({ productId, isWishlisted, action }) => ({
  type: "wishlist_heart",
  productId,
  isWishlisted, // seeds initial state
  action,
}),

pageView: ({ children, height = 400 }) => ({
    type: "sizedBox",
    height: height,
    child: {
      type: "custom_page_view",
      children: children || []
    }
  }),
  popScope: ({ canPop = false, action, child }) => ({
    type: "popScope",
    canPop,
    onPopInvokedAction: action,
    child
  }),

  // 2. Add the Action (Under your SDUI ACTIONS section)
  exitApp: () => ({
    actionType: "exit_app"
  }),
  aspectRatio: ({ aspectRatio, child }) => ({
    type: "aspectRatio",
    aspectRatio,
    child
  }),
  spacer: () => ({ type: "spacer" }),
};