var Listing = {};

$(document).ready(function () {
  /* Shared Events */
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

  /* Listing Events */
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
    var form = $(this).closest("form");
    var factor = $(this).hasClass("prev") ? 1 : -1;
    progress(form, factor);
    var target = $(".wizard-instructions");
    $("html, body").animate({
      scrollTop: target.offset().top - 80
    }, 500);
  });
  $("button.finish").click(function () {
    $.ajax({
      url: "/listings/add",
      method: "post",
      contentType: "application/json",
      data: JSON.stringify({}),
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

  /* Activity Events */
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
  $("#post-activity").click(function () {
    var activity = {
      name: $("#activity_name").val(),
      description: $("#activity_description").val(),
      tags: $("#activity_tags").data("tags"),
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
    $.ajax({
      url: "/activities/add",
      method: "post",
      contentType: "application/json",
      data: JSON.stringify(activity),
      success: function (d, s, x) {
        console.log(d);
        return;
        window.location.href = "/activities/" + d.id + "/added";
      }
    });
  });
});