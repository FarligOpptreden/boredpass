var Shared = {};

$(document).ready(function () {
  Shared.showOverlay = function (args) {
    var overlay = $("<div class=\"overlay\" />");
    args.content.addClass("overlay-content");
    $("body").append(overlay);
    $("body").append(args.content);
    if (args.callback)
      args.callback();
    Shared.inputFields();
    setTimeout(function () {
      $(".wrapper").addClass("mask");
      overlay.addClass("show");
      args.content.addClass("show");
    }, 100);
  };
  Shared.hideOverlay = function (args) {
    $(".overlay, .overlay-content").removeClass("show");
    $(".wrapper").removeClass("mask");
    setTimeout(function () {
      $(".overlay, .overlay-content").remove();
    }, 350);
  };
  Shared.inputFields = function () {
    $(".field-wrapper input:not(.has-events), .field-wrapper textarea:not(.has-events)").each(function () {
      $(this).addClass("has-events");
      $(this).focus(function () {
        $(this).closest(".field-wrapper").addClass("focus");
      });
      $(this).blur(function () {
        if ($(this).val())
          $(this).closest(".field-wrapper").addClass("has-value");
        else
          $(this).closest(".field-wrapper").removeClass("has-value");
        $(this).closest(".field-wrapper").removeClass("focus");
      });
    });
    $(".toggle-wrapper button:not(.has-events)").each(function () {
      $(this).addClass("has-events");
      $(this).click(function () {
        if ($(this).hasClass("active"))
          return;
        $(this).closest(".toggle-wrapper").find("button.active").removeClass("active");
        $(this).addClass("active");
      });
    });
    $(".checkbox-wrapper .checkbox-option:not(.has-events)").each(function () {
      var wrapper = $(this);
      wrapper.addClass("has-events");
      var fauxInput = $("<a class='faux-input' href='javascript:void(0);' />");
      wrapper.prepend(fauxInput);
      var label = wrapper.find("label");
      var currentInput = wrapper.find("input");
      var input = $("<input type=\"text\" />");
      input.attr("id", currentInput.attr("id"));
      input.attr("className", currentInput.attr("className"));
      currentInput.replaceWith(input);
      input = wrapper.find("input");
      input.val(wrapper.hasClass("checked"));
      if (wrapper.hasClass("checked"))
        fauxInput.addClass("fa fa-check");
      var toggle = function (e) {
        if (!wrapper.hasClass("checked")) {
          input.val("true");
          wrapper.addClass("checked");
          fauxInput.addClass("fa fa-check");
        }
        else {
          input.val("false");
          wrapper.removeClass("checked");
          fauxInput.removeClass("fa fa-check");
        }
        input.trigger("change");
      };
      label.click(toggle);
      fauxInput.click(toggle);
    });
  };
});