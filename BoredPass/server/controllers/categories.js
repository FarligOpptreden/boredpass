import { Controller } from "../../handlr";
import { 
  get_html_name, 
  get_html_name_skip 
} from "./implementation/categories";

export default new Controller("/categories")
  .handle({ route: "/:name", method: "get", produces: "html" }, get_html_name)
  .handle({ route: "/:name/:skip", method: "get", produces: "html" }, get_html_name_skip);
