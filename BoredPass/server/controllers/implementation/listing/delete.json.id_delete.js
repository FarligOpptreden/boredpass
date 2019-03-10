import { ListingsService, ActivitiesService } from "../../../services";

export const delete_json_id_delete = (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.deleteListing
  )
    return res.status(403).send({
      success: false,
      message: "Unauthorized"
    });

  Promise.resolve()
    .then(_ =>
      ActivitiesService.deleteMany({
        filter: { listing_id: ActivitiesService.db.objectId(req.params.id) }
      })
    )
    .then(_ => ListingsService.delete({ filter: req.params.id }))
    .then(r => res.json(r))
    .catch(err =>
      res.status(500).json({
        success: false,
        message: `Something unexpected happened: ${err}`
      })
    );
};
