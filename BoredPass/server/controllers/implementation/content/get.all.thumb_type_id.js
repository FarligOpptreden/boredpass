import { ContentService } from "../../../services";

export const get_all_thumb_type_id = (req, res) =>
  ContentService.readThumb({
    fileId: req.params.id,
    fileType: req.params.type
  })
    .then(data => res.end(data, "binary"))
    .catch(_ => res.status(500).send(null));
