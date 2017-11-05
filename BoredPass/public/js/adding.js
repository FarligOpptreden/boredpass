var Listing = {};

$(document).ready(function () {
  /* Shared Events */
  (function () {
    Shared.inputFields();
    var onUpload = function () {
      var field = Shared.photoUpload({
        data: [{
          key: "url",
          value: $(this).data("url")
        }],
        onUpload: onUpload,
        onDelete: onDelete
      });
      $(this).after(field);
      if ($(".wizard-content").length)
        $(".wizard-content").height(field.closest("form").outerHeight());
    };
    var onDelete = function () {
      var form = $(this).closest("form");
      setTimeout(function () {
        if ($(".wizard-content").length)
          $(".wizard-content").height(form.outerHeight());
      }, 50);
    };
    $(".add-photos .photo-upload").on("boredpass.upload", onUpload);
    $(".add-photos .photo-upload").on("boredpass.delete", onDelete);
  })();
  /* Listing Events */
  (function () {
    $(".wizard-content").height($(".wizard-content form:first").outerHeight());
    $("form").on("submit", function onFormSubmit() {
      return false;
    });
    var wizardForms = $(".wizard-content form");
    var translateIndex = 0;
    var progress = function (form, factor) {
      var stepIndex = wizardForms.index(form) + (factor > 0 ? -1 : 1);
      var stepIndicator = $(".wizard-steps > div > a").eq(wizardForms.index(form));
      stepIndicator.removeClass("active");
      if (!stepIndicator.hasClass("completed"))
        stepIndicator.addClass("completed");
      $(".wizard-steps > div > a").eq(stepIndex).addClass("active");
      form.removeClass("active");
      var newForm = form[factor > 0 ? "prev" : "next"]("form");
      newForm.addClass("active");
      var translate = (translateIndex += factor) * 100;
      wizardForms.each(function () {
        $(this).css({ transform: "translateX(" + translate + "%)" });
      });
      $(".wizard-instructions-content").html(newForm.find(".instructions-template").children().clone());
      $(".wizard-content").height(newForm.outerHeight());
    };
    $("button.next, button.prev").click(function () {
      var prefix = "";
      if ($(".wizard-content"))
        prefix = ".active ";
      $(prefix + ".mandatory").trigger("keyup");
      if ($(prefix + ".error").length) {
        $(prefix + ".error:first").find("input, textarea").focus();
        return false;
      }
      var form = $(this).closest("form");
      var factor = $(this).hasClass("prev") ? 1 : -1;
      progress(form, factor);
      var target = $(".wizard-instructions");
      $("html, body").animate({
        scrollTop: target.offset().top - 80
      }, 500);
    });
    $("button.finish").click(function () {
      var listing = {
        name: $("#businessname").val(),
        description: $("#description").val(),
        tags: $("#tags").data("tags"),
        address: $("#address").val(),
        website: $("#website").val(),
        owner: $("#yourbusiness").val().toLowerCase() === "yes",
        telephone: $("#telephone").val(),
        cellphone: $("#cellphone").val(),
        email: $("#email").val(),
        social: {
          facebook: $("#social-facebook").val(),
          twitter: $("#social-twitter").val(),
          google: $("#social-google").val(),
          instagram: $("#social-instagram").val(),
          pinterest: $("#social-pinterest").val(),
          youtube: $("#social-youtube").val()
        },
        logo: (function () {
          var upload = $("#logo-upload .has-image").data("upload");
          if (!upload)
            return null;
          return {
            fileId: upload.fileId,
            fileType: upload.fileType
          }
        })(),
        photos: (function () {
          var arr = [];
          $(".add-photos .photo-upload .has-image").each(function () {
            var photo = $(this).data("upload");
            if (!photo)
              return;
            arr.push({
              fileId: photo.fileId,
              fileType: photo.fileType
            });
          });
          return arr;
        })(),
        facilities: {
          wheelchair: $("#facility_wheelchair").val().toLowerCase() === "yes",
          children: $("#facility_children").val().toLowerCase() === "yes",
          dogs: $("#facility_dogs").val().toLowerCase() === "yes",
          picnic: $("#facility_picnic").val().toLowerCase() === "yes"
        }
      };
      $.ajax({
        url: "/listings/add",
        method: "post",
        contentType: "application/json",
        data: JSON.stringify(listing),
        success: function (d, s, x) {
          window.location.href = "/listings/" + d.id + "/added";
        }
      });
    });
    $(".social a").click(function () {
      var linkList = $(this).closest(".links");
      var linkIndex = linkList.find("a").index($(this));
      linkList.find(".active").removeClass("active");
      $(this).addClass("active");
      linkList.nextAll("input:not(.hidden)").addClass("hidden");
      linkList.nextAll("input").eq(linkIndex).removeClass("hidden");
    });
    $(".social input").on("keyup", function () {
      var inputIndex = $(".social").find("input").index($(this));
      var operation = $(this).val() ? "addClass" : "removeClass";
      $(".social .links a").eq(inputIndex)[operation]("has-value");
    });
    $(".add-activity").click(function () {
      window.location.href = $(this).data("link");
    });
  })();
  /* Activity Events */
  (function () {
    $(".prices input").change(function () {
      var isChecked = $(this).closest(".checkbox-option").hasClass("checked");
      var priceField = $(".field-wrapper." + $(this).attr("id"));
      if (priceField.length)
        priceField[isChecked ? "removeClass" : "addClass"]("hidden");
    });
    $(".trading-hours input").change(function () {
      var isChecked = $(this).closest(".checkbox-option").hasClass("checked");
      var wrapper = $(this).closest(".day-time-wrapper");
      if (isChecked)
        wrapper.find("select").removeAttr("disabled");
      else
        wrapper.find("select").attr("disabled", "disabled");
    });
    $("#activity_tags").focus(function () {
      var search = $(this);
      var tags = $(this).next(".tag-search");
      if (tags.length) {
        tags.removeClass("hidden");
        return;
      }
      var container = $("<div class=\"tag-search hidden\" />");
      $.ajax({
        url: "/tags/search",
        method: "get",
        success: function (d, s, x) {
          container.removeClass("hidden");
          for (var i in d) {
            (function (tag) {
              var anchor = $("<a href=\"javascript:void(0);\" class=\"tag icon activity colour " + tag.icon + "\">" + tag.name + "</a>");
              if ($(".tag-container > ." + tag.icon).length)
                anchor.addClass("selected");
              anchor.click(function () {
                search.addClass("keep-open");
                var operation = anchor.hasClass("selected") ? "removeClass" : "addClass";
                anchor[operation]("selected");
                if (operation === "removeClass")
                  $(".tag-container").find("." + tag.icon).remove();
                else {
                  var addedTag = $("<span class=\"tag icon activity colour " + tag.icon + "\">" + tag.name + "</span>");
                  addedTag.data("tag", tag);
                  $(".tag-container").append(addedTag);
                }
                $("#activity_tags").focus();
                var addedTags = "";
                $(".tag-container > span").each(function () {
                  addedTags += $(this).data("tag").name + ";";
                });
                search.val(addedTags);
                setTimeout(function () {
                  search.removeClass("keep-open");
                }, 100);
              });
              container.append(anchor);
            })(d[i]);
          }
        }
      });
      $(this).after(container);
      var close = $("<button class=\"close\">+</button>");
      close.click(function () {
        container.addClass("hidden");
        search.blur();
      });
      container.prepend(close);
    });
    $("#activity_tags").blur(function () {
      var search = $(this);
      setTimeout(function () {
        if (search.hasClass("keep-open"))
          return;
        search.next(".tag-search").addClass("hidden");
      }, 150);
    });
    $("#activity_tags + .tag-container").click(function () {
      $("#activity_tags").focus();
    });
    $("#post-activity").click(function () {
      $(".mandatory").trigger("keyup");
      if ($(".error").length) {
        $(".error:first").find("input, textarea").focus();
        return false;
      }
      var activity = {
        name: $("#activity_name").val(),
        description: $("#activity_description").val(),
        tags: (function () {
          var tags = [];
          $(".tag-container > span").each(function () {
            tags.push($(this).data("tag"));
          });
          return tags;
        })(),
        address: $("#activity_address").val(),
        prices: {
          free: $("#price_free").val() === "true",
          child: $("#price_kids").val() === "true" ? $("#price_kids_value").val() : null,
          adult: $("#price_adults").val() === "true" ? $("#price_adults_value").val() : null,
          pensioner: $("#price_pensioners").val() === "true" ? $("#price_pensioners_value").val() : null
        },
        tradingHours: {
          monday: $("#day_monday").val() === "true" ? {
            from: $("#day_monday_from").val(),
            to: $("#day_monday_to").val()
          } : null,
          tuesday: $("#day_tuesday").val() === "true" ? {
            from: $("#day_tuesday_from").val(),
            to: $("#day_tuesday_to").val()
          } : null,
          wednesday: $("#day_wednesday").val() === "true" ? {
            from: $("#day_wednesday_from").val(),
            to: $("#day_wednesday_to").val()
          } : null,
          thursday: $("#day_thursday").val() === "true" ? {
            from: $("#day_thursday_from").val(),
            to: $("#day_thursday_to").val()
          } : null,
          friday: $("#day_friday").val() === "true" ? {
            from: $("#day_friday_from").val(),
            to: $("#day_friday_to").val()
          } : null,
          saturday: $("#day_saturday").val() === "true" ? {
            from: $("#day_saturday_from").val(),
            to: $("#day_saturday_to").val()
          } : null,
          sunday: $("#day_sunday").val() === "true" ? {
            from: $("#day_sunday_from").val(),
            to: $("#day_sunday_to").val()
          } : null
        },
        photos: (function () {
          var arr = [];
          $(".photo-upload .has-image").each(function () {
            var photo = $(this).data("upload");
            arr.push({
              fileId: photo.fileId,
              fileType: photo.fileType
            });
          });
          return arr;
        })()
      };
      var mode = $("#mode").val();
      $.ajax({
        url: "/activities/" + $("#" + (mode === "add" ? "listing" : "activity")).val() + "/" + mode + "?v=" + new Date().getTime(),
        method: $("#mode").val() === "add" ? "post" : "put",
        contentType: "application/json",
        data: JSON.stringify(activity),
        success: function (d, s, x) {
          window.location.href = "/activities/" + d.id;
        }
      });
    });
  })();
});