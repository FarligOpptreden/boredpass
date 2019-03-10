import { ContentService } from "../../../services";

export const post_json_upload = (req, res) =>
  ContentService.upload({
    req: req
  })
    .then(d => res.json(d))
    .catch(err =>
      res.status(500).send({
        success: false,
        message: err
      })
    );
