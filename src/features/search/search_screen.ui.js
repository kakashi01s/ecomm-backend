import { stac } from "../../core/sdui/StacWidgets.js";
import { ui, Brand } from "../../core/sdui/components.js";
import { AppIcons } from "../../core/constants/icons.js";
import { w } from "../../core/sdui/widgets.js";
import { Endpoints } from "../../core/constants/apiEndpoints.js";

export class SearchScreenUI {
  static buildSearchPage(query = "", suggestions = []) {
    return stac.scaffold({
      backgroundColor: Brand.background,
      
      // We use a custom AppBar container to hold the live search field
      appBar: stac.appBar({
        backgroundColor: Brand.surface,
        elevation: 0,
        leading: w.iconButton({
          icon: AppIcons.BACK,
          action: stac.navigate(null, "pop"),
          color: Brand.textPrimary,
        }),
        title: stac.form({
          // The form captures the text field value for the onChanged API request
          child: w.searchBar({
            hintText: "Search rings, necklaces...",
            isReadOnly: false,        // Enables live typing
            inputId: "search_query",
            autofocus: true,          // Pops the keyboard instantly
          }),
        }),
      }),

      body: stac.singleChildScrollView({
        child: stac.padding({
          all: 16,
          child: stac.column({
            crossAxisAlignment: "stretch",
            children: suggestions.length > 0 
              ? suggestions.map(item => SearchScreenUI._suggestionTile(item))
              : [SearchScreenUI._emptyOrTrendingState(query)],
          }),
        }),
      }),
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────

  static _suggestionTile(item) {
    return stac.inkWell({
      // Pushing to results creates the chain!
      action: stac.navigate(Endpoints.SEARCH.RESULTS(encodeURIComponent(item.name)), "push"),
      child: stac.container({
        padding: [0, 16, 0, 16],
        decoration: { border: { bottom: { color: Brand.divider, width: 1 } } },
        child: stac.row({
          children: [
            // Left Icon or Thumbnail
            item.imageUrl 
              ? stac.clipRRect({
                  borderRadius: 8,
                  child: stac.image({ src: item.imageUrl, width: 40, height: 40, fit: "cover" })
                })
              : stac.container({
                  width: 40, height: 40,
                  decoration: { color: Brand.surface, borderRadius: 8, border: { color: Brand.divider, width: 1 } },
                  child: stac.center({ child: stac.svg({ src: AppIcons.SEARCH, color: Brand.textSecondary, width: 20, height: 20 }) })
                }),
            
            stac.sizedBox({ width: 16 }),
            
            // Text Info
            stac.expanded({
              child: stac.column({
                crossAxisAlignment: "start",
                children: [
                  stac.text(item.name, {
                    maxLines: 1, overflow: "ellipsis",
                    style: stac.textStyle({ fontSize: 15, color: Brand.textPrimary, fontWeight: "w500" })
                  }),
                  ...(item.subtitle ? [
                    stac.sizedBox({ height: 4 }),
                    stac.text(item.subtitle, {
                      style: stac.textStyle({ fontSize: 12, color: Brand.textSecondary })
                    })
                  ] : [])
                ]
              })
            }),
            
            // Trailing Arrow
            stac.svg({ src: AppIcons.NEXT, color: "#CCCCCC", width: 16, height: 16 })
          ]
        })
      })
    });
  }

  static _emptyOrTrendingState(query) {
    if (query.length > 0) {
      return stac.padding({
        top: 40,
        child: stac.center({
          child: stac.text(`No results found for "${query}"`, {
            style: stac.textStyle({ color: Brand.textSecondary, fontSize: 14 })
          })
        })
      });
    }

    return stac.column({
      crossAxisAlignment: "start",
      children: [
        stac.text("Trending Searches", {
          style: stac.textStyle({ fontSize: 16, fontWeight: "bold", color: Brand.textPrimary })
        }),
        stac.sizedBox({ height: 16 }),
        {
          type: "webScrollRow", // Uses your horizontal scroller
          padding: [0, 0, 0, 0],
          children: [
            ui.categoryChip({ title: "Gold Rings", action: stac.navigate(Endpoints.SEARCH.RESULTS("Gold Rings"), "push") }),
            stac.sizedBox({ width: 8 }),
            ui.categoryChip({ title: "Diamond Necklaces", action: stac.navigate(Endpoints.SEARCH.RESULTS("Diamond Necklaces"), "push") }),
            stac.sizedBox({ width: 8 }),
            ui.categoryChip({ title: "Engagement", action: stac.navigate(Endpoints.SEARCH.RESULTS("Engagement"), "push") }),
          ]
        }
      ]
    });
  }
}