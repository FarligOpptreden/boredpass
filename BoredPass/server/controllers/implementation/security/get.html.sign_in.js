export const get_html_sign_in = (req, res) => {
  res.render("partials/sign_in_modal", req.query);
};
