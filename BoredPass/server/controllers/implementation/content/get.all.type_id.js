import { ContentService } from "../../../services";

export const get_all_type_id = (req, res) =>
  ContentService.readResource({
    fileId: req.params.id,
    fileType: req.params.type
  })
    .then(path => res.sendFile(path))
    .catch(_ => res.status(500).send(null));
