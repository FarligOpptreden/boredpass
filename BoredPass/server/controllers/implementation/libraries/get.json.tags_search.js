import { TagsService } from "../../../services";

export const get_json_tags_search = (req, res) =>
  TagsService.findMany({
    filter: { name: { $regex: `^${req.query.search}.*`, $options: "i" } },
    sort: { name: 1 },
    limit: 5
  })
    .then(tags => res.json(tags))
    .catch(err => res.json(null));
