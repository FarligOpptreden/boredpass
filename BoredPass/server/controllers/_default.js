import { Controller } from "../../handlr";
import {
  get_html_frequently_asked_questions,
  get_html_root,
  get_html_terms_and_conditions
} from "./implementation/_default";

export default Controller.create("/")
  .handle({ route: "/", method: "get", produces: "html" }, get_html_root)
  .handle({ route: "/terms-and-conditions", method: "get", produces: "html" }, get_html_terms_and_conditions)
  .handle({ route: "/frequently-asked-questions", method: "get", produces: "html" }, get_html_frequently_asked_questions);
