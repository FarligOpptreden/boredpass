import { ListingsService } from "../../../services";
import config from "../../../../config";

export const post_json_id_claim = async (req, res) => {
  if (!req.authentication || !req.authentication.isAuthenticated)
    return res.status(403).json("error", {
      error: {
        status: 403,
        stack: config.app.debug && err.stack
      },
      message:
        "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?"
    });

  try {
    const r = await ListingsService.initiateClaim({
      listing_id: req.params.id,
      user: req.authentication.user
    });
    res.json(r);
  } catch (err) {
    res.status(err.status || 500).json({
      error: {
        status: err.status || 500,
        stack: config.app.debug && err.stack
      },
      message: err.status
        ? err.message
        : `Something unexpected happened: ${err}`
    });
  }
};
