import { LocationService } from "../../../services";

export const get_html_location = (req, res) =>
  LocationService.search({
    search: req.query.search
  })
    .then(r =>
      res.send({
        success: true,
        data: r
      })
    )
    .catch(err =>
      res.send({
        success: false,
        error: err
      })
    );
