export const stac = {
  // ==========================================
  // 1. STYLING HELPERS
  // ==========================================
  textStyle: ({ fontSize, fontWeight, color, letterSpacing, backgroundColor, decoration, fontStyle, height, overflow } = {}) => ({
    fontSize, fontWeight, color, letterSpacing, backgroundColor, decoration, fontStyle, height, overflow
  }),

  boxDecoration: ({ color, borderRadius, border, boxShadow, shape = "rectangle", gradient, image } = {}) => ({
    color, borderRadius, border, boxShadow, shape, gradient, image
  }),

  // ==========================================
  // 2. LAYOUTS & CONTAINERS
  // ==========================================
  scaffold: ({ appBar, body, backgroundColor, bottomNavigationBar, floatingActionButton, drawer, extendBody = false, extendBodyBehindAppBar = false, resizeToAvoidBottomInset = true } = {}) => ({
    type: "scaffold", backgroundColor, appBar, body, bottomNavigationBar, floatingActionButton, drawer, extendBody, extendBodyBehindAppBar, resizeToAvoidBottomInset
  }),

  appBar: ({ title, backgroundColor, elevation, centerTitle = true, leading, actions, toolbarHeight, automaticallyImplyLeading = true, flexibleSpace, bottom } = {}) => ({
    type: "appBar", title: typeof title === 'string' ? stac.text(title, { style: stac.textStyle({ fontSize: 20, fontWeight: "bold" }) }) : title,
    backgroundColor, elevation, centerTitle, leading, actions, toolbarHeight, automaticallyImplyLeading, flexibleSpace, bottom
  }),

  singleChildScrollView: ({ child, padding, scrollDirection = "vertical", reverse = false, physics } = {}) => ({ 
    type: "singleChildScrollView", padding, scrollDirection, reverse, physics, child 
  }),

  // webScrollRow: ({ children, padding } = {}) => ({
  //   type: "webScrollRow", padding, children: children || []
  // }),

  listView: ({ children, padding, shrinkWrap = false, scrollDirection = "vertical", physics, reverse = false } = {}) => ({
    type: "listView", padding, shrinkWrap, scrollDirection, physics, reverse, children: children || []
  }),

  column: ({ children, mainAxisAlignment = "start", crossAxisAlignment = "center", mainAxisSize = "max", textDirection, verticalDirection = "down" } = {}) => ({
    type: "column", mainAxisAlignment, crossAxisAlignment, mainAxisSize, textDirection, verticalDirection, children: children || []
  }),

  row: ({ children, mainAxisAlignment = "start", crossAxisAlignment = "center", mainAxisSize = "max", textDirection, verticalDirection = "down" } = {}) => ({
    type: "row", mainAxisAlignment, crossAxisAlignment, mainAxisSize, textDirection, verticalDirection, children: children || []
  }),

  wrap: ({ children, direction = "horizontal", alignment = "start", spacing = 0.0, runAlignment = "start", runSpacing = 0.0, crossAxisAlignment = "start" }) => ({
    type: "wrap", direction, alignment, spacing, runAlignment, runSpacing, crossAxisAlignment, children: children || []
  }),

  expanded: ({ child, flex = 1 }) => ({ type: "expanded", flex, child }),
  flexible: ({ child, flex = 1, fit = "loose" }) => ({ type: "flexible", flex, fit, child }),
  
  align: ({ alignment = "center", widthFactor, heightFactor, child }) => ({ type: "align", alignment, widthFactor, heightFactor, child }),
  center: ({ child, widthFactor, heightFactor }) => ({ type: "center", widthFactor, heightFactor, child }),

  padding: ({ all, vertical, horizontal, top, bottom, left, right, child }) => {
    let p = all !== undefined ? [all, all, all, all] : (vertical !== undefined || horizontal !== undefined) ? [horizontal || 0, vertical || 0, horizontal || 0, vertical || 0] : [left || 0, top || 0, right || 0, bottom || 0];
    return { type: "padding", padding: p, child };
  },

  container: ({ width, height, padding, margin, decoration, color, child, alignment, clipBehavior = "none", constraints } = {}) => ({
    type: "container", width, height, padding, margin, decoration, color, alignment, clipBehavior, constraints, child
  }),

  sizedBox: ({ width, height, child } = {}) => ({ type: "sizedBox", width, height, child }),

  card: ({ child, color, elevation, margin, shape, clipBehavior = "none", shadowColor } = {}) => ({
    type: "card", color, elevation, margin, shape, clipBehavior, shadowColor, child
  }),

  divider: ({ color, height, thickness, indent, endIndent } = {}) => ({
    type: "divider", color, height, thickness, indent, endIndent
  }),

  // ==========================================
  // 3. UI ELEMENTS & INPUTS
  // ==========================================
  text: (text, { style, textAlign, maxLines, overflow, textDirection } = {}) => ({
    type: "text", data: text, style, textAlign, maxLines, overflow, textDirection
  }),

  image: ({ src, imageType = "network", color, width, height, fit = "cover", errorWidget, alignment = "center", repeat = "noRepeat" }) => ({
    type: "image", imageType, src, color, width, height, fit, alignment, repeat, errorWidget 
  }),

  icon: ({ icon, color, size, textDirection } = {}) => ({
    type: "icon", icon, color, size, textDirection
  }),

  circularProgressIndicator: ({ color, strokeWidth = 4.0, backgroundColor } = {}) => ({ 
    type: "circularProgressIndicator", color, strokeWidth, backgroundColor 
  }),

  button: ({ text, action, style, color, textColor } = {}) => ({
    type: "elevatedButton",
    child: stac.text(text, { style: stac.textStyle({ color: textColor }) }),
    onPressed: action,
    style: style || { backgroundColor: color } 
  }),

  textFormField: ({ id, hintText, labelText, obscureText, keyboardType, prefixIcon, suffixIcon, validators, decoration, autofocus = false, initialValue, maxLength } = {}) => ({
    type: "textFormField", id, autofocus, initialValue, maxLength,
    decoration: decoration || { hintText, labelText, border: { type: "outlineInputBorder" } },
    obscureText: obscureText || false, keyboardType, validators: validators || [] 
  }),

  textField: ({ id, hintText, labelText, obscureText, keyboardType, decoration, autofocus = false, onChanged, onSubmitted, maxLength } = {}) => ({
    type: "textField", id, autofocus, maxLength,
    decoration: decoration || { hintText, labelText, border: { type: "outlineInputBorder" } },
    obscureText: obscureText || false, keyboardType, onChanged, onSubmitted
  }),

  checkbox: ({ id, title, value = false, activeColor, checkColor } = {}) => ({
    type: "checkboxListTile", id, title: stac.text(title), value, activeColor, checkColor
  }),

  // ==========================================
  // 4. SDUI ACTIONS
  // ==========================================
  navigate: (url, action = "push", ui = null, loadingUi = null) => ({
    actionType: "server_navigate", url, action, ui, loadingUi: loadingUi || { type: "scaffold", backgroundColor: "#F8F9FA", body: { type: "center", child: { type: "circularProgressIndicator", color: "#FF5722" } } }
  }),
  manageSession: (sessionAction, tokens, nextAction) => ({
    actionType: "manage_session", sessionAction, accessToken: tokens?.accessToken, refreshToken: tokens?.refreshToken, nextAction
  }),
  showSnackbar: (message, nextAction) => ({ actionType: "show_snackbar", message, nextAction }),
  showToast: (message, { backgroundColor, textColor, fontSize, gravity, nextAction } = {}) => ({
    actionType: "show_toast", message, backgroundColor, textColor, fontSize, gravity, nextAction
  }),
  apiRequest: ({ url, method = "POST", body, onSuccess, onError }) => ({
    actionType: "api_request", url, method, body, onSuccess, onError
  }),
  form: ({ child }) => ({ type: "form", child }),

  // ==========================================
  // 5. RESPONSIVE & ADVANCED BLOCKS
  // ==========================================
  responsiveVisibility: ({ hiddenWhen = [], visibleWhen = [], child }) => ({
    type: "responsive_visibility", hiddenWhen, visibleWhen, child
  }),

  gridView: ({ children, crossAxisCount = 2, mainAxisSpacing = 16, crossAxisSpacing = 16, childAspectRatio = 0.75, padding, shrinkWrap = false, physics, scrollDirection = "vertical" } = {}) => ({
    type: "gridView", crossAxisCount, mainAxisSpacing, crossAxisSpacing, childAspectRatio, padding, shrinkWrap, physics, scrollDirection, children: children || []
  }),

  stack: ({ children, alignment = "topLeft", fit = "loose", clipBehavior = "hardEdge" }) => ({
    type: "stack", alignment, fit, clipBehavior, children: children || []
  }),

  positioned: ({ top, bottom, left, right, width, height, child }) => ({
    type: "positioned", top, bottom, left, right, width, height, child
  }),

  clipRRect: ({ borderRadius, clipBehavior = "antiAlias", child }) => ({
    type: "clipRRect", borderRadius, clipBehavior, child
  }),

  inkWell: ({ action, child, splashColor, highlightColor, borderRadius }) => ({
    type: "inkWell", onTap: action, splashColor, highlightColor, borderRadius, child
  }),
  
  asyncButton: ({ action, loadingColor, child }) => ({
    type: "async_button", action, loadingColor, child
  }),

  defaultBottomNavigationController: ({ length, initialIndex = 0, child }) => ({
    type: "defaultBottomNavigationController", length, initialIndex, child
  }),

  bottomNavigationBar: ({ items, elevation = 0, barType = "fixed", backgroundColor, iconSize, selectedItemColor, unselectedItemColor, selectedFontSize, unselectedFontSize, showSelectedLabels = true, showUnselectedLabels = true }) => ({
    type: "bottomNavigationBar", items: items || [], elevation, barType, bottomNavigationBarType: barType, backgroundColor, iconSize, selectedItemColor, unselectedItemColor, selectedFontSize, unselectedFontSize, showSelectedLabels, showUnselectedLabels
  }),

  changeTab: (index) => ({ actionType: "change_tab_index", index: index }),
  handleDashboardBack: (exitDialogAction) => ({ actionType: "handle_dashboard_back", exitDialogAction }),
  
  bottomNavigationBarItem: ({ icon, activeIcon, label, backgroundColor, tooltip }) => ({
    icon: typeof icon === 'string' ? { type: "icon", icon } : icon,
    activeIcon: activeIcon ? (typeof activeIcon === 'string' ? { type: "icon", icon: activeIcon } : activeIcon) : undefined,
    label, backgroundColor, tooltip
  }),

  bottomNavigationView: ({ children }) => ({ type: "bottomNavigationView", children: children || [] }),
  showDialog: (widget) => ({ actionType: "showDialog", widget }),
  customScrollView: ({ slivers, physics, scrollDirection = "vertical", reverse = false, shrinkWrap = false } = {}) => ({
    type: "customScrollView", physics, scrollDirection, reverse, shrinkWrap, slivers: slivers || []
  }),
  
  safeArea: ({ top = true, bottom = true, left = true, right = true, child }) => ({ 
    type: "safeArea", top, bottom, left, right, child 
  }),

  sliverAppBar: ({ title, backgroundColor, pinned = true, floating = false, primary, toolbarHeight, expandedHeight, flexibleSpace, leading, actions, elevation, centerTitle, automaticallyImplyLeading } = {}) => ({
    type: "sliverAppBar", automaticallyImplyLeading, title: typeof title === 'string' ? stac.text(title, { style: stac.textStyle({ color: "#FFFFFF", fontWeight: "bold" }) }) : title,
    backgroundColor, pinned, floating, primary, toolbarHeight, expandedHeight, flexibleSpace, leading, actions, elevation, centerTitle
  }),

  flexibleSpaceBar: ({ background, title, centerTitle = false, collapseMode = "parallax" }) => ({
    type: "flexibleSpaceBar", background, title, centerTitle, collapseMode
  }),

  sliverToBoxAdapter: ({ child }) => ({ type: "sliverToBoxAdapter", child }),
  hero: ({ tag, child }) => ({ type: "hero", tag, child }),
  
  svg: ({ src, isNetwork = false, color, width, height, rotationDegrees = 0 }) => ({
    type: "svg_asset", src, isNetwork, color, width, height, rotationDegrees
  }),

  badge: ({ child, count = 0, color = "#D32F2F", textColor = "#FFFFFF", size = 16, position = { top: 0, right: 0 } }) => ({
    type: "badge", count, color, textColor, size, position, child,
  }),

  video: ({ src, autoPlay = true, loop = true, muted = true, showControls = false, width, height, fit = "cover" }) => ({
    type: "video", src, autoPlay, loop, muted, showControls, width, height, fit
  }),

  carousel: ({ items, height = 180, autoPlayIntervalSeconds = 4, borderRadius = 16 } = {}) => ({
    type: "carousel", height, autoPlayIntervalSeconds, borderRadius, items: items || []
  }),

  popThen: (nextAction) => ({ actionType: "server_navigate", action: "pop", nextAction }),
  keyboardAvoiding: ({ child }) => ({ type: "keyboardAvoiding", child }),
  
  showBottomSheet: (widget, { isScrollControlled = true, backgroundColor, elevation, shape } = {}) => ({ 
    actionType: "showModalBottomSheet", widget, isScrollControlled, backgroundColor, elevation, shape
  }),
  
  wishlistHeart: ({ productId, isWishlisted, action }) => ({
    type: "wishlist_heart", productId, isWishlisted, action,
  }),

  pageView: ({ children, height = 400 }) => ({
    type: "sizedBox", height: height, child: { type: "custom_page_view", children: children || [] }
  }),

  popScope: ({ canPop = false, action, child }) => ({
    type: "popScope", canPop, onPopInvokedAction: action, child
  }),

  exitApp: () => ({ actionType: "exit_app" }),
  aspectRatio: ({ aspectRatio, child }) => ({ type: "aspectRatio", aspectRatio, child }),
  spacer: ({ flex = 1 } = {}) => ({ type: "spacer", flex }),
  opacity: ({ opacity, child }) => ({ type: "opacity", opacity, child }),
  fittedBox: ({ fit = "contain", alignment = "center", child }) => ({ type: "fittedBox", fit, alignment, child }),
  reactiveBuilder: ({ listenTo = [], child }) => ({
    type: "reactive_builder",
    listenTo,
    child
  }),

  setGlobalState: (mutations, nextAction) => ({
    actionType: "set_global_state",
    mutations,
    nextAction
  }),

  wrap: ({ children, direction="horizontal", spacing=0, runSpacing=0 }) => ({ type: "wrap", direction, spacing, runSpacing, children }),
  opacity: ({ opacity, child }) => ({ type: "opacity", opacity, child }),
  fittedBox: ({ fit = "contain", child }) => ({ type: "fittedBox", fit, child }),
  flexible: ({ child, flex = 1, fit = "loose" }) => ({ type: "flexible", flex, fit, child }),
  badge: ({ child, count, color, textColor, size = 16, position = { top: 0, right: 0 } }) => ({
    type: "badge", count, color, textColor, size, position, child
  }),
  conditionalAction: ({ stateKey, expectedValue, defaultValue, onTrue, onFalse }) => ({
    actionType: "conditional",
    stateKey,
    expectedValue,
    defaultValue,
    onTrue,
    onFalse
  }),
  conditionalWidget: ({ stateKey, expectedValue, defaultValue, onTrue, onFalse }) => ({
    type: "conditional_widget",
    stateKey,
    expectedValue,
    defaultValue,
    onTrue,
    onFalse
  }),
  indexedStack: ({ index = 0, children = [] }) => ({
    type: "indexedStack",
    index,
    children: children || []
  }),
};