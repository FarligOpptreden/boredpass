import { Controller } from "../../handlr";
import {
  get_html_sign_in,
  get_json_oauth_provider_result,
  get_json_oauth_provider_start,
  get_json_sign_out,
  post_json_sign_in,
  post_json_sign_up
} from "./implementation/security";

export default new Controller("/secure")
  .handle(
    { route: "/sign-in", method: "get", produces: "html" },
    get_html_sign_in
  )
  .handle(
    { route: "/sign-out", method: "get", produces: "json" },
    get_json_sign_out
  )
  .handle(
    { route: "/sign-in", method: "post", consumes: "json", produces: "json" },
    post_json_sign_in
  )
  .handle(
    { route: "/sign-up", method: "post", consumes: "json", produces: "json" },
    post_json_sign_up
  )
  .handle(
    {
      route: "/oauth/:provider/start",
      method: "get",
      consumes: "json",
      produces: "json"
    },
    get_json_oauth_provider_start
  )
  .handle(
    {
      route: "/oauth/:provider/result",
      method: "get",
      consumes: "json",
      produces: "json"
    },
    get_json_oauth_provider_result
  );
