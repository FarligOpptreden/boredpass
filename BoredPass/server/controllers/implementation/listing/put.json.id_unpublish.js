import { ListingsService } from "../../../services";

export const put_json_id_unpublish = async (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.publishListing
  )
    return res.status(403).send({
      success: false,
      message: "Unauthorized"
    });

  try {
    const r = await ListingsService.updatedPublishedState({
      listing_id: req.params.id,
      published: false
    });
    res.json(r);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Something unexpected happened: ${err}`
    });
  }
};
