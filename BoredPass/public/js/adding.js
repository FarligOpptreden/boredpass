var Listing = {};

$(document).ready(function () {
  $(".wizard-content").height($(".wizard-content form:first").outerHeight());
  Shared.inputFields();
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
      url: '/listings/add',
      method: 'post',
      contentType: 'application/json',
      data: JSON.stringify({}),
      success: function (d, s, x) {
        window.location.href = '/listings/' + d.id + '/added';
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
  $(".prices input").change(function () {
    var isChecked = $(this).closest(".checkbox-option").hasClass("checked");
    var priceField = $(".field-wrapper." + $(this).attr("id"));
    if (priceField.length)
      priceField[isChecked ? "removeClass" : "addClass"]("hidden");
  });
});