import { Controller } from "../../handlr";
import {
  get_html_load,
  get_html_location,
  get_html_page
} from "./implementation/search";

export default new Controller("/search")
  .handle({ route: "/load", method: "get", produces: "html" }, get_html_load)
  .handle(
    { route: "/location", method: "get", produces: "html" },
    get_html_location
  )
  .handle({ route: "/:page", method: "get", produces: "html" }, get_html_page);
