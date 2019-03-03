$(document).ready(function() {
  var position = null;

  $("#load-more").click(function(e, initialLoad) {
    e.preventDefault();
    var loadingTemplate = $(".listing.template");
    for (var i = 0; i < 12; i++) {
      var loading = loadingTemplate.clone();
      loading.removeClass("template");
      $(".buttons").before(loading);
    }
    var url = $("#load-more").attr("href");
    var urlParts = url.split("/");
    var currentPage = initialLoad
      ? 0
      : parseInt(urlParts[urlParts.length - 1], 10);
    var nextPage = parseInt(urlParts[urlParts.length - 1], 10) + 12;

    urlParts.splice(urlParts.length - 1, 1);
    url = urlParts.join("/") + "/" + currentPage;

    $.ajax({
      url:
        url +
        (position
          ? "?lat=" +
            position.coords.latitude +
            "&lng=" +
            position.coords.longitude
          : ""),
      method: "get"
    }).done(function(html) {
      $(".buttons").before(html);
      $(".listing.loading:not(.template)").remove();

      if ($(".no-more-data").length) return $(".buttons").remove();

      if (initialLoad) return;

      var nextUrl = urlParts.join("/") + "/" + nextPage;
      $("#load-more").attr("href", nextUrl);
    });
    return;
  });

  Shared.location({
    callback: function(pos) {
      position = pos;
      $("#load-more").trigger("click", [true]);
    }
  });
});
