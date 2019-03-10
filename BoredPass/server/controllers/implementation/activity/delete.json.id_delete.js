import { ActivitiesService } from "../../../services";

export const delete_json_id_delete = (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.deleteExperience
  ) {
    res.status(403);
    res.send({
      success: false,
      message: "Unauthorized"
    });
    return;
  }

  ActivitiesService.delete({ filter: req.params.id })
    .then(r => res.json(r))
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
