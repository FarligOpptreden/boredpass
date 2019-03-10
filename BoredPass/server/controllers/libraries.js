import Controller from "../../handlr/Controller";
import {
  get_html_banners_list,
  get_html_tags_list,
  get_json_tags_search
} from "./implementation/libraries";

export default new Controller("/libraries")
  .handle({ route: "/tags/search", method: "get", produces: "json" }, get_json_tags_search)
  .handle({ route: "/tags/list", method: "get", produces: "html" }, get_html_tags_list)
  .handle({ route: "/banners/list", method: "get", produces: "html" }, get_html_banners_list);
