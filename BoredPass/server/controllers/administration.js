import { Controller } from "../../handlr";
import { get_html_category_page } from "./implementation/administration";

export default new Controller("/administration").handle(
  { route: "/:category/:page", method: "get", produces: "html" },
  get_html_category_page
);
