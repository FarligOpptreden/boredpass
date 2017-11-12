var Listing = {};

$(document).ready(function () {
  /* Shared Events */
  (function () {
    Shared.inputFields();
    $(".listing-section.facilities .facility").click(function () {
      if ($(this).hasClass("selected"))
        $(this).removeClass("selected")
      else
        $(this).addClass("selected");
    });
  })();
  /* Listing Events */
  (function () {
  })();
  /* Activity Events */
  (function () {
  })();
});