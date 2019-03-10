import Controller from "../../handlr/Controller";
import {
  get_all_svg_type_name,
  get_all_thumb_type_id,
  get_all_type_id,
  post_json_upload
} from "./implementation/content";

export default new Controller("/content")
  .handle({ route: "/svg/:type/:name" }, get_all_svg_type_name)
  .handle({ route: "/upload", method: "post", produces: "json" }, post_json_upload)
  .handle({ route: "/:type/:id/", method: "get" }, get_all_type_id)
  .handle({ route: "/thumb/:type/:id/", method: "get" }, get_all_thumb_type_id);
