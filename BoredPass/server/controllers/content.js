import Controller from "../../handlr/Controller";
import { ContentService } from "../services";

export default new Controller("/content")
  .handle({ route: "/svg/:type/:name" }, (req, res) =>
    ContentService.svg({
      type: req.params.type,
      name: req.params.name,
      colour: req.query.colour
    })
      .then(svg => {
        res.setHeader("content-type", "image/svg+xml");
        res.send(svg);
      })
      .catch(_ => res.status(500).send(null))
  )
  .handle({ route: "/upload", method: "post", produces: "json" }, (req, res) =>
    ContentService.upload({
      req: req
    })
      .then(d => res.json(d))
      .catch(err =>
        res.status(500).send({
          success: false,
          message: err
        })
      )
  )
  .handle({ route: "/:type/:id/", method: "get" }, (req, res) =>
    ContentService.readResource({
      fileId: req.params.id,
      fileType: req.params.type
    })
      .then(path => res.sendFile(path))
      .catch(_ => res.status(500).send(null))
  )
  .handle({ route: "/thumb/:type/:id/", method: "get" }, (req, res) =>
    ContentService.readThumb({
      fileId: req.params.id,
      fileType: req.params.type
    })
      .then(data => res.end(data, "binary"))
      .catch(_ => res.status(500).send(null))
  );
