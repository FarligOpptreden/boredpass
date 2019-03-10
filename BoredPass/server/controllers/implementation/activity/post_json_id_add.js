import { ActivitiesService } from "../../../services";

export const post_json_id_add = (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.addExperience
  ) {
    res.status(403);
    res.send({
      success: false,
      message: "Unauthorized"
    });
    return;
  }

  let activity = req.body;
  activity.listing_id = ActivitiesService.db.objectId(req.params.id);
  ActivitiesService.create({ data: activity })
    .then(result =>
      res.json({
        success: result && result._id && true,
        id: result._id && result._id
      })
    )
    .catch(err => {
      res.status(500);
      res.send({
        success: false,
        message: `Could not create activity: ${err}`
      });
    });
};
