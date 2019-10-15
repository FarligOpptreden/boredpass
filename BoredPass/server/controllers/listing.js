import { Controller } from "../../handlr";
import {
  delete_json_id_delete,
  get_html_add,
  get_html_add_wizard,
  get_html_id,
  get_html_id_added,
  get_html_id_edit,
  get_html_id_review,
  get_json_duplicates_search,
  post_html_add,
  post_json_id_review,
  put_json_id_edit,
  get_html_id_reviews
} from "./implementation/listing";

export default new Controller("/listings")
  .handle(
    { route: "/duplicates/:search", method: "get", produces: "json" },
    get_json_duplicates_search
  )
  .handle({ route: "/add", method: "get", produces: "html" }, get_html_add)
  .handle(
    { route: "/add/wizard", method: "get", produces: "html" },
    get_html_add_wizard
  )
  .handle({ route: "/add", method: "post", produces: "html" }, post_html_add)
  .handle(
    { route: "/:id/added", method: "get", produces: "html" },
    get_html_id_added
  )
  .handle({ route: "/:id", method: "get", produces: "html" }, get_html_id)
  .handle(
    { route: "/:id/edit", method: "get", produces: "html" },
    get_html_id_edit
  )
  .handle(
    { route: "/:id/edit", method: "put", produces: "json" },
    put_json_id_edit
  )
  .handle(
    { route: "/:id/delete", method: "delete", produces: "json" },
    delete_json_id_delete
  )
  .handle(
    { route: "/:id/review", method: "get", produces: "html" },
    get_html_id_review
  )
  .handle(
    { route: "/:id/review", method: "post", produces: "json" },
    post_json_id_review
  )
  .handle(
    { route: "/:id/reviews", method: "get", produces: "html" },
    get_html_id_reviews
  )
  .handle(
    { route: "/:id/:name", method: "get", produces: "html" },
    get_html_id
  );
