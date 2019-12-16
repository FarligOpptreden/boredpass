import { Controller } from "../../handlr";
import {
  get_html_id_name,
  post_json_id_follow,
  delete_json_id_follow
} from "./implementation/user";

export default new Controller("/user")
  .handle(
    { route: "/:id/follow", method: "post", produces: "json" },
    post_json_id_follow
  )
  .handle(
    { route: "/:id/follow", method: "delete", produces: "json" },
    delete_json_id_follow
  )
  .handle(
    { route: "/:id/:name", method: "get", produces: "html" },
    get_html_id_name
  );
