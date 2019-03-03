import { Controller } from "../../handlr";
import { SecurityService } from "../services";

export default new Controller("/secure")
  .handle({ route: "/sign-in", method: "get", produces: "html" }, (_, res) => {
    res.render("partials/sign_in_modal", {});
  })
  .handle({ route: "/sign-out", method: "get", produces: "json" }, (req, res) =>
    SecurityService.signOut(req, res)
      .then(r => res.send(r))
      .catch(r => res.send(r))
  )
  .handle(
    { route: "/sign-in", method: "post", consumes: "json", produces: "json" },
    (req, res) =>
      SecurityService.signIn(req.body, res)
        .then(r => res.send(r))
        .catch(err => res.send(err))
  )
  .handle(
    { route: "/sign-up", method: "post", consumes: "json", produces: "json" },
    (req, res) =>
      SecurityService.signUp(req.body)
        .then(r => res.send(r))
        .catch(err => res.send(err))
  )
  .handle(
    {
      route: "/oauth/:provider/start",
      method: "get",
      consumes: "json",
      produces: "json"
    },
    SecurityService.startOauth
  )
  .handle(
    {
      route: "/oauth/:provider/result",
      method: "get",
      consumes: "json",
      produces: "json"
    },
    SecurityService.endOauth
  );
