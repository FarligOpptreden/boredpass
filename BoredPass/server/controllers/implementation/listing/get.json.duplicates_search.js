import { ListingsService } from "../../../services";

export const get_json_duplicates_search = async (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.addListing
  )
    return res.status(403).send({
      success: false,
      message: "Unauthorized"
    });

  try {
    const duplicates = await ListingsService.findMany({
      filter: {
        name: { $regex: `^${req.params.search}.*`, $options: "i" }
      },
      data: { name: 1, formatted_address: 1 }
    });
    res.json({
      success: true,
      listings: duplicates
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Something unexpected happened: ${err}`
    });
  }
};
