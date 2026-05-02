import { SearchRepository } from "./search.repository.js";

export class SearchController {
  /**
   * POST /api/dashboard/search/suggestions
   * Body: { search_query: string }
   * Returns: { results: SuggestionItem[] }
   *
   * This is the ONLY search endpoint you need.
   * The nativeSearchOverlay widget calls this directly from Flutter — no full UI rebuild.
   */
  static async suggestions(req, res) {
    try {
      const query = (req.body?.search_query ?? "").trim();

      if (query.length < 2) {
        return res.json({ results: [] });
      }

      const results = await SearchRepository.suggest(query);
      return res.json({ results });
    } catch (error) {
      console.error("[SearchController.suggestions]", error);
      return res.status(500).json({ message: "Search error", error: error.message });
    }
  }
}
