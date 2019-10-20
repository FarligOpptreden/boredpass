import { ListingsService, ActivitiesService } from "../../../services";

export const delete_json_id_delete = async (req, res) => {
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

  try {
    await ActivitiesService.deleteMany({
      filter: { listing_id: ActivitiesService.db.objectId(req.params.id) }
    });
    const r = await ListingsService.delete({ filter: req.params.id });
    res.json(r);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Something unexpected happened: ${err}`
    });
  }
};
