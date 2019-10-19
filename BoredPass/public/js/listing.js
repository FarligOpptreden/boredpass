$(document).ready(function() {
  var doLightbox = function(photo) {
    if ($(".light-box").length) return;

    var lightBox = $('<div class="light-box" />');
    var prev = $('<a href="prev-photo" class="prev fa fa-angle-left" />');
    var next = $('<a href="next-photo" class="next fa fa-angle-right" />');
    var close = $('<a href="close" class="close">+</a>');

    var allPhotos = $(".listing-section.photos .photo");
    var photoIndex = allPhotos.index(photo.closest(".photo"));
    var index = 0;
    allPhotos.each(function() {
      var photo = $('<div class="photo" />');
      photo.css(
        "background-image",
        $(this)
          .find("a")
          .css("background-image")
      );
      index++ !== photoIndex && photo.addClass("hidden");
      lightBox.append(photo);
    });
    photoIndex === 0 && prev.addClass("hidden");
    photoIndex === allPhotos.length - 1 && next.addClass("hidden");

    prev.click(function(e) {
      e.preventDefault();

      if (photoIndex === 0) return false;

      var currentPhoto = lightBox.find(".photo:not(.hidden)");
      var prevPhoto = currentPhoto.prev(".photo");
      currentPhoto.addClass("hidden");
      prevPhoto.removeClass("hidden");
      photoIndex--;
      (photoIndex === 0 && prev.addClass("hidden")) ||
        prev.removeClass("hidden");
      (photoIndex === allPhotos.length - 1 && next.addClass("hidden")) ||
        next.removeClass("hidden");
      return false;
    });
    next.click(function(e) {
      e.preventDefault();

      if (photoIndex === allPhotos.length - 1) return false;

      var currentPhoto = lightBox.find(".photo:not(.hidden)");
      var nextPhoto = currentPhoto.next(".photo");
      currentPhoto.addClass("hidden");
      nextPhoto.removeClass("hidden");
      photoIndex++;
      (photoIndex === 0 && prev.addClass("hidden")) ||
        prev.removeClass("hidden");
      (photoIndex === allPhotos.length - 1 && next.addClass("hidden")) ||
        next.removeClass("hidden");
      return false;
    });
    close.click(function(e) {
      e.preventDefault();
      lightBox.remove();
      return false;
    });

    lightBox.click(function() {
      close.trigger("click");
    });
    lightBox.append(close);
    lightBox.append(prev);
    lightBox.append(next);
    $("body").append(lightBox);
  };

  $("a.delete").click(function(e) {
    e.preventDefault();
    var type = $(this).hasClass("listing") ? "listing" : "activity";
    var typeName = type === "listing" ? "listing" : "experience";
    var url = $(this).attr("href");
    Shared.confirm({
      message: "Are you sure you want to delete this " + typeName + "?",
      positive: {
        text: "Yes",
        click: function() {
          $.ajax({
            url: url,
            method: "delete",
            dataType: "json"
          }).done(function(data) {
            document.location.href = "/";
          });
          return true;
        }
      },
      negative: {
        text: "No"
      }
    });
    return false;
  });

  $(".listing-section .photo a").click(function() {
    doLightbox($(this));
  });

  $(".review-stars > a")
    .hover(function() {
      $(this)
        .prevAll("a")
        .addClass("color");
      $(this)
        .nextAll("a")
        .removeClass("color");
      $(this).addClass("color");
    })
    .click(function(e) {
      e.preventDefault();
      var signIn = $("#header > nav a.sign-in");

      if (signIn.length) {
        signIn.trigger("click");
        return false;
      }

      $.ajax({
        url:
          "/listings/" +
          $(this).data("id") +
          "/review?rating=" +
          $(this).data("rating"),
        method: "get",
        accept: "text/html",
        success: function(d, s, x) {
          var content = $(d);

          content
            .find(".review-stars > a")
            .hover(function() {
              $(this)
                .prevAll("a")
                .addClass("color");
              $(this)
                .nextAll("a")
                .removeClass("color");
              $(this).addClass("color");
            })
            .click(function(e) {
              e.preventDefault();
              return false;
            });

          content.find(".close").click(function(e) {
            e.preventDefault();
            Shared.hideOverlay(null, content.closest(".overlay"));
          });

          content.find("button").click(function() {
            var isPrimary = $(this).hasClass("primary");
            var rating = content.find("a.fa-star.color:last").data("rating");
            var listingId = content.find("a.fa-star.color:last").data("id");
            var review = "";

            if (isPrimary) {
              content.removeClass("no-no");
              content.find(".mandatory").trigger("keyup");

              if (content.find(".error").length) {
                content.addClass("no-no");
                content.find(".mandatory:first").focus();
                return;
              }

              review = content.find("textarea").val();
            }

            $.ajax({
              url: "/listings/" + listingId + "/review",
              method: "post",
              contentType: "application/json",
              accept: "application/json",
              data: JSON.stringify({
                rating: rating,
                review: review
              }),
              success: function(d, s, x) {
                if (!d.success) {
                  Shared.confirm({ message: d.message });
                  return;
                }

                Shared.hideOverlay(null, content.closest(".overlay"));
              }
            });
          });

          Shared.inputFields(content);

          Shared.showOverlay({
            content: content
          });
        }
      });

      return false;
    });

  $(".review-stars").hover(null, function() {
    var rating = parseInt($(this).data("rating") || 0, 10);
    $(this)
      .find("a")
      .each(function() {
        var val = parseInt($(this).data("rating"), 10);

        $(this)[val > rating ? "removeClass" : "addClass"]("color");
      });
  });

  $(".latest-reviews a.review-card").click(function(e) {
    e.preventDefault();

    $.ajax({
      url: "/listings/" + $(this).data("listing_id") + "/reviews",
      method: "get",
      accept: "text/html",
      success: function(d, s, x) {
        var content = $(d);
        content.find(".close").click(function(e) {
          e.preventDefault();
          Shared.hideOverlay(null, content.closest(".overlay"));
        });

        Shared.showOverlay({
          content: content
        });
      }
    });

    return false;
  });

  $(".claim-listing").click(function(e) {
    e.preventDefault();

    var ctx = $(this);

    if (ctx.hasClass("disabled")) return;

    ctx.addClass("disabled");
    $.ajax({
      url: "/listings/" + ctx.data("listing_id") + "/claim",
      method: "post",
      accept: "application/json",
      success: function(d, s, x) {
        ctx.removeClass("disabled");

        if (d.success)
          return Shared.confirm({
            message:
              "Your claim to the listing has been initiated! An email has been sent to <em>" +
              d.email +
              "</em> to start the process. You have 24 hours to act on the instructions after which your claim expires.",
            positive: {
              text: "Ok"
            }
          });

        Shared.confirm({
          message:
            "Uh-oh! Seems like there was a problem initiating the claim. Please try again, or get in contact with our support line.",
          positive: {
            text: "Ok"
          }
        });
      },
      error: function(d, s, x) {
        ctx.removeClass("disabled");
        Shared.confirm({
          message: d.responseJSON.message,
          positive: {
            text: "Ok"
          }
        });
      }
    });

    return false;
  });
});
