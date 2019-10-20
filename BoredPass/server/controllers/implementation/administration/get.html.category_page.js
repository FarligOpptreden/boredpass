import config from "../../../../config";
import { ListingsService } from "../../../services";
import { StringUtils } from "../../../utils";

export const get_html_category_page = async (req, res) => {
  if (
    !req.authentication ||
    !req.authentication.isAuthenticated ||
    !req.authentication.user.permissions ||
    !req.authentication.user.permissions.addListing
  )
    return res.status(403).render("error", {
      error: {
        status: 403,
        stack: config.app.debug && err.stack
      },
      message:
        "You seem to have stumbled where you don't belong. Are you perhaps looking for something else?",
      categories: req.listing_categories
    });

  try {
    const category = req.params.category.toLowerCase();
    const pageNo = parseInt(req.params.page);
    let filter;

    switch (category) {
      case "pending-approval":
        filter = {
          published: false
        };
        break;
      case "reported":
        filter = {
          reported: true
        };
        break;
    }

    const pagedData = await ListingsService.page({
      pageNo: pageNo,
      pageSize: 12,
      filter: filter,
      sort: { _id: -1 }
    });
    res.render("listing_administration", {
      title: `Listing Administration - BoredPass`,
      authentication: req.authentication,
      moment: require("moment"),
      marked: require("marked"),
      pagedData: pagedData,
      makeUrlFriendly: StringUtils.makeUrlFriendly,
      prevLink: pageNo > 1 && `/administration/${category}/${pageNo - 1}`,
      nextLink:
        pageNo < pagedData.pageCount &&
        `/administration/${category}/${pageNo + 1}`,
      category: category,
      categories: req.listing_categories
    });
  } catch (err) {
    res.status(500).render("error", {
      error: {
        status: 500,
        stack: config.app.debug && err.stack
      },
      message: `Something unexpected happened: ${err}`,
      categories: req.listing_categories,
      moment: require("moment")
    });
  }
};
