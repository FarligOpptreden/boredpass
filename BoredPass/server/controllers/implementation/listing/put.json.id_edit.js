import { ListingsService } from "../../../services";

export const put_json_id_edit = (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.editListing
  )
    return res.status(403).send({
      success: false,
      message: "Unauthorized"
    });

  let listing = req.body;
  ListingsService.update({
    filter: req.params.id,
    data: listing
  })
    .then(result =>
      res.json({
        success: result && true,
        id: result && req.params.id
      })
    )
    .catch(err =>
      res.status(500).json({
        success: false,
        message: `Something unexpected happened: ${err}`
      })
    );
};
