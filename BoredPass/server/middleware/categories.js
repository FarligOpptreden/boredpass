import { TagsService } from "../services";

export default class Cache {
  static get(app) {
    app.all("*", (req, _, next) => {
      TagsService.uniqueCategories().then(categories => {
        req.listing_categories = categories.map(c => {
          return {
            category: c.category,
            urlCategory: c.category
              .toLowerCase()
              .replace(/\s/g, "-")
              .replace(/\&/g, "and"),
            tags: c.tags
          };
        });
        next();
      });
    });
  }
}
