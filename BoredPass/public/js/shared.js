var Shared = {};

$(document).ready(function () {
  var uploadField = function () {
    var wrapper = $(this);
    var anchor = wrapper.find("a");
    var form = $("<form method='post' enctype='multipart/form-data' />");
    wrapper.append(form);
    var input = $("<input type=\"file\" id='file-upload' name='file-upload' />");
    input.change(function () {
      if (!$(this).val())
        return;
      var data = new FormData(form[0]);
      $.ajax({
        url: wrapper.data("url") + '?v=' + new Date().getTime(),
        type: "POST",
        data: data,
        processData: false,
        contentType: false,
        cache: false,
        success: function (d) {
          wrapper.trigger("boredpass.upload");
          anchor.data("upload", d);
          anchor.addClass("has-image");
          anchor.css("background-image", "url(" + d.location + ")");
          if (wrapper.data("allow-change"))
            return;
          form.remove();
          anchor.find("span").remove();
          anchor.unbind("click");
          anchor.append("<span class=\"close\">+</span>");
          anchor.bind("click", function () {
            wrapper.trigger("boredpass.delete");
            wrapper.remove();
          });
        },
        error: function (e) {
          alert(e);
        }
      });
    });
    form.append(input);
    wrapper.addClass("has-events");
    anchor.bind("click", function () {
      input.trigger("click");
    });
  };
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
      if ($(this).hasClass("mandatory"))
        $(this).keyup(function () {
          if ($(this).val())
            $(this).closest(".field-wrapper").removeClass("error");
          else
            $(this).closest(".field-wrapper").addClass("error");
        });
      if ($(this).hasClass("validate-number"))
        $(this).keydown(function (e) {
          if ((e.keyCode != 32 && e.keyCode <= 46) || (e.keyCode >= 112 && e.keyCode <= 145))
            return true;
          var keyCode = e.which;
          if (keyCode >= 96)
            keyCode -= 48;
          var keyVal = String.fromCharCode(keyCode);
          if (!/\d/.test(keyVal)) {
            e.preventDefault();
            return false;
          }
          var fld = $(this);
          if (fld.attr("type") == "number") {
            var min = $(this).attr("min");
            var max = $(this).attr("max");
            var val = parseFloat($(this).val() + parseFloat(keyVal));
            if (val < min || val > max) {
              e.preventDefault();
              return false;
            }
            return true;
          }
          var maxLength = $(this).attr("maxlength");
          var val = $(this).val() + keyVal;
          if (val.length > maxLength) {
            e.preventDefault();
            return false;
          }
          return true;
        });
      if ($(this).hasClass("validate-email"))
        $(this).keyup(function () {
          var valid = /^[a-zA-Z0-9\-\.]+@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9]+){1,2}$/.test($(this).val());
          if (valid)
            $(this).closest(".field-wrapper").removeClass("error");
          else
            $(this).closest(".field-wrapper").addClass("error");
        });
    });
    $(".toggle-wrapper button:not(.has-events)").each(function () {
      var wrapper = $(this).closest(".toggle-wrapper");
      $(this).addClass("has-events");
      var input = wrapper.find("input");
      input.val(wrapper.find(".active").text());
      $(this).click(function () {
        input.val($(this).text());
        if ($(this).hasClass("active"))
          return;
        $(this).closest(".toggle-wrapper").find("button.active").removeClass("active");
        $(this).addClass("active");
      });
    });
    $(".checkbox-option:not(.has-events)").each(function () {
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
    $(".photo-upload:not(.has-events)").each(uploadField);
  };
  Shared.photoUpload = function (args) {
    var field = $("<div class=\"photo-upload\"><a><span class=\"plus\">+</span></a></div>");
    field.addClass(args.classes);
    if (args.data && args.data.length) {
      for (var d = 0; d < args.data.length; d++) {
        var data = args.data[d];
        field.data(data.key, data.value);
      }
    }
    if (args.onUpload)
      field.on("boredpass.upload", args.onUpload);
    if (args.onDelete)
      field.on("boredpass.delete", args.onDelete);
    field.each(uploadField);
    return field;
  };
});