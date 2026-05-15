import { SearchRepository } from "./search.repository.js";
import { SearchResultsUI } from "./search_results.ui.js";
import { AsyncHandler } from "../../utils/asyncHandler.js";
import prisma from "../../core/prisma/client.js";
import { SearchScreenUI } from "./search_screen.ui.js";
import { stac } from "../../core/sdui/StacWidgets.js";
import { GlobalStateHelper } from "../app/utilities/globalState.util.js";


export class SearchController {

  /**
   * GET /api/search
   * Returns the initial, blank dedicated search screen.
   */
  static getSearchScreen = AsyncHandler(async (req, res) => {
    const ui = SearchScreenUI.buildSearchPage("", []);
    return res.status(200).json({ui:ui});
  });

  /**
   * POST /api/dashboard/search/live
   * Hit by the `onChanged` API request in your w.searchBar.
   * Returns an SDUI navigation action to seamlessly replace the UI with new results.
   */
static liveSearch = AsyncHandler(async (req, res) => {
    // FIX: Look for req.body.search_query (which matches the inputId in widgets.js)
    const query = (req.body?.search_query ?? "").trim();
    
    let suggestions = [];

    if (query.length >= 2) {
      suggestions = await SearchRepository.suggest(query);
    }

    // Generate the updated UI
    const updatedUi = SearchScreenUI.buildSearchPage(query, suggestions);

    // Return a "replace" navigation action so Flutter swaps the screen instantly
    return res.status(200).json(
      stac.navigate(null, "seamless_replace", updatedUi)
    );
  });

  
  /**
   * Existing Suggestions Endpoint
   */
  static async suggestions(req, res) {
    try {
      const query = (req.body?.search_query ?? "").trim();
      if (query.length < 2) return res.json({ results: [] });
      const results = await SearchRepository.suggest(query);
      return res.json({ results });
    } catch (error) {
      console.error("[SearchController.suggestions]", error);
      return res.status(500).json({ message: "Search error", error: error.message });
    }
  }

  /**
   * GET /api/search/results?q=rings&page=1
   * Full Page SDUI Builder for Search Results.
   */
  static getResults = AsyncHandler(async (req, res) => {
    const query = req.query.q?.trim() || "";
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    
    // SDUI Pagination Trick: Take all products up to the requested page.
    // When the user hits "Load More", we navigate(replace) with page 2, fetching 20 items. 
    // This allows seamless appending without needing a native array-concat handler.
    const takeAmount = page * limit;

    const user = req.user;
    const isGuest = !user;

    const searchCondition = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    };

    // 1. Fetch matching products and the absolute total count
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: searchCondition,
        select: {
          id: true, 
          name: true, 
          price: true,        // Regular price
          salePrice: true,    // Discounted price
          images: { select: { url: true, mediaType: true }, take: 1 },
          category: { select: { name: true } },
        },
        take: takeAmount,
        orderBy: { name: "asc" },
      }),
      prisma.product.count({ where: searchCondition })
    ]);

    // 2. Gather User-Specific Maps (Cart Qty and Wishlist checks)
    const userCartMap = {};
    const userWishlistSet = new Set();

    if (!isGuest) {
      const userId = user.id;
      const [cartItems, wishlistItems] = await Promise.all([
        prisma.cartItem.findMany({ where: { userId }, select: { productId: true, quantity: true } }),
        prisma.wishlist.findMany({ where: { userId }, select: { productId: true } })
      ]);
      cartItems.forEach(i => (userCartMap[i.productId] = i.quantity));
      wishlistItems.forEach(i => userWishlistSet.add(i.productId));
    }

    const hasMore = totalCount > takeAmount;

    // 3. Build UI JSON
    const ui = SearchResultsUI.buildResultsPage({
      query,
      products,
      totalCount,
      isGuest,
      userCartMap,
      userWishlistSet,
      page,
      hasMore,
    });

    // 4. Attach Meta (Forces native AppBar badges to instantly show accurate values)
    const meta = user 
      ? await GlobalStateHelper.getGlobalMeta(user, req.headers) 
      : GlobalStateHelper.baseMeta();

    return res.status(200).json({ ui, meta });
  });
}