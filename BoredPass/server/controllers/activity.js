import Controller from "../../handlr/Controller";
import {
  delete_json_id_delete,
  get_html_add,
  get_html_add_done,
  get_html_id,
  get_html_id_edit,
  put_json_id_edit,
  post_json_id_add
} from "./implementation/activity";

export default new Controller("/activities")
  .handle({ route: "/add", method: "get", produces: "html" }, get_html_add)
  .handle({ route: "/:id/add", method: "post", produces: "json" }, post_json_id_add)
  .handle({ route: "/add/done", method: "get", produces: "html" }, get_html_add_done)
  .handle({ route: "/:id", method: "get", produces: "html" }, get_html_id)
  .handle({ route: "/:id/edit", method: "get", produces: "html" }, get_html_id_edit)
  .handle({ route: "/:id/edit", method: "put", produces: "json" }, put_json_id_edit)
  .handle({ route: "/:id/delete", method: "delete", produces: "json" }, delete_json_id_delete);
