import { Controller } from "../../handlr";
import { get_html_id } from "./implementation/user";

export default new Controller("/user")
  .handle({ route: "/:id", method: "get", produces: "html" }, get_html_id);
