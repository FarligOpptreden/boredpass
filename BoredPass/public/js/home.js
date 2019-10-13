$(document).ready(function() {
  $("#showstats").click(function() {
    if ($(this).text() == "Show") {
      $(this).text("Hide");
      $(".statistics .statistic").removeClass("hidden");
      return;
    }

    $(this).text("Show");
    $(".statistics .statistic").addClass("hidden");
  });
  $("#home-down").click(function() {
    $("html, body").animate(
      {
        scrollTop:
          $(".banner.home").height() - $(".banner.home > nav").height() - 36
      },
      500
    );
  });
  Shared.location({
    callback: function(position) {
      $.ajax({
        url: position
          ? "/?lat=" +
            position.coords.latitude +
            "&lng=" +
            position.coords.longitude
          : "/?all=true",
        method: "get"
      }).done(function(html) {
        $(".listings").replaceWith(html);
      });
    }
  });
  BoredPass.Search.render($("section.banner.home nav a.find"));
  $("section.banner.home nav a.add").click(function(e) {
    var signIn = $("#header > nav a.sign-in");

    if (signIn.length) {
      e.preventDefault();
      signIn.trigger("click");
      return false;
    }

    return true;
  });
});
