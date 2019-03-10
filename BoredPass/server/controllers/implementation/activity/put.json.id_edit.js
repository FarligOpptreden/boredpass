import { ActivitiesService } from "../../../services";

export const put_json_id_edit = (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.editExperience
  ) {
    res.status(403);
    res.send({
      success: false,
      message: "Unauthorized"
    });
    return;
  }

  let activity = req.body;
  ActivitiesService.update({ filter: req.params.id, data: activity })
    .then(result =>
      res.json({
        success: result && true,
        id: result && req.params.id
      })
    )
    .catch(err => {
      res.status(500);
      res.render("error", {
        error: {
          status: 500,
          stack: config.app.debug && err.stack
        },
        message: `Something unexpected happened: ${err}`
      });
    });
};
