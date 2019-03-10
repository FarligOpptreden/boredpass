import { ContentService } from "../../../services";

export const get_all_svg_type_name = (req, res) =>
  ContentService.svg({
    type: req.params.type,
    name: req.params.name,
    colour: req.query.colour
  })
    .then(svg => {
      res.setHeader("content-type", "image/svg+xml");
      res.send(svg);
    })
    .catch(_ => res.status(500).send(null));
