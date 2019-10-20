var Shared = {};

$(document).ready(function() {
  var validateNumber = function(e) {
    if (
      (e.keyCode !== 32 && e.keyCode <= 46) ||
      (e.keyCode >= 112 && e.keyCode <= 145)
    )
      return true;

    var keyCode = e.which;

    if (keyCode >= 96) keyCode -= 48;

    var keyVal = String.fromCharCode(keyCode);
    var $this = $(this);

    var testForNumber = function(v) {
      v = v || keyVal;

      if (!/\d/.test(v)) {
        e.preventDefault();
        return false;
      }

      var val;

      if ($this.attr("type") === "number") {
        var min = $this.attr("min");
        var max = $this.attr("max");
        val = parseFloat($this.val() + parseFloat(v));

        if (val < min || val > max) {
          e.preventDefault();
          return false;
        }

        return true;
      }

      var maxLength = $this.attr("maxlength");
      val = $this.val() + v;

      if (val.length > maxLength) {
        e.preventDefault();
        return false;
      }

      return true;
    };

    if (e.ctrlKey && keyVal.toLowerCase() === "v")
      return (
        setTimeout(function() {
          !testForNumber($this.val()) && $this.val("");
        }, 10) && true
      );

    return testForNumber();
  };

  var validations = function() {
    var fieldWrapper = $(this).closest(".field-wrapper");
    $(this).addClass("has-events");
    $(this).focus(function() {
      fieldWrapper.addClass("focus");
    });
    $(this).blur(function() {
      fieldWrapper[$(this).val() ? "addClass" : "removeClass"]("has-value");
      fieldWrapper.removeClass("focus");
    });
    if ($(this).hasClass("mandatory")) {
      if ($(this).closest(".tag-field").length) {
        var field = $(this);
        field.keyup(function() {
          fieldWrapper[
            field.data("value") && field.data("value").length
              ? "removeClass"
              : "addClass"
          ]("error");
        });
      } else
        $(this).keyup(function() {
          fieldWrapper[$(this).val() ? "removeClass" : "addClass"]("error");
        });
    }
    $(this).hasClass("validate-number") && $(this).keydown(validateNumber);
    $(this).hasClass("validate-email") &&
      $(this)
        .keyup(function() {
          var valid = /^[a-zA-Z0-9\-\.\_]+@[a-zA-Z0-9\-\_]+(\.[a-zA-Z0-9\-\_]+){1,3}$/.test(
            $(this).val()
          );
          fieldWrapper[valid ? "removeClass" : "addClass"]("error");
        })
        .focus(function(e) {
          $(this).attr("placeholder", "name@domain.com");
        })
        .blur(function(e) {
          $(this).removeAttr("placeholder");
        });
    $(this).hasClass("validate-custom") &&
      $(this).keyup(function() {
        var func = $(this).data("validate");

        if (!func) return fieldWrapper.addClass("error");

        var funcParts = func.split(".");
        var scope = null;

        for (var i = 0; i < funcParts.length; i++) {
          if (i == 0) {
            scope = eval(funcParts[i]);
            continue;
          }

          scope = scope[funcParts[i]];
        }

        if (!scope) return fieldWrapper.addClass("error");

        var valid = scope($(this).val());
        fieldWrapper[valid ? "removeClass" : "addClass"]("error");
      });
  };

  var uploadField = function() {
    var wrapper = $(this);
    var anchor = wrapper.find("a");
    var form = $("<form method='post' enctype='multipart/form-data' />");
    wrapper.append(form);
    var input = $(
      '<input type="file" id=\'file-upload-' +
        ($("#file-upload").length + 1) +
        "' name='file-upload-" +
        ($("#file-upload").length + 1) +
        "' />"
    );
    input.change(function() {
      if (!$(this).val()) return;
      var data = new FormData(form[0]);
      $.ajax({
        url: wrapper.data("url") + "?v=" + new Date().getTime(),
        type: "POST",
        data: data,
        processData: false,
        contentType: false,
        cache: false,
        success: function(d) {
          wrapper.trigger("boredpass.upload");
          anchor.data("upload", d);
          anchor.addClass("has-image");
          anchor.css("background-image", "url(" + d.location + ")");

          if (anchor.data("uploaded")) anchor.data("uploaded")(d);

          if (wrapper.data("allow-change")) return;

          form.remove();
          anchor.find("span").remove();
          anchor.unbind("click");
          anchor.append('<span class="close">+</span>');
          anchor.bind("click", function() {
            wrapper.trigger("boredpass.delete");
            wrapper.remove();
          });
        },
        error: function(e) {
          alert(e);
        }
      });
    });
    form.append(input);
    wrapper.addClass("has-events");
    if (anchor.hasClass("has-image")) {
      anchor.find("span").remove();
      anchor.append('<span class="close">+</span>');
    }
    anchor.bind("click", function() {
      if (anchor.hasClass("has-image") && !wrapper.data("allow-change")) {
        wrapper.trigger("boredpass.delete");
        wrapper.remove();
        return;
      }
      input.trigger("click");
    });
  };

  var activityTags = function() {
    var search = $(this);
    var wrapper = search.closest(".field-wrapper");
    var tagField = wrapper.closest(".tag-field");
    var resultContainer = null;
    var values = search.data("value") || [];
    var clear = function() {
      resultContainer && resultContainer.remove();
      resultContainer = null;
      search.val("");
      wrapper.removeClass("has-value");
    };
    var updateTags = function(container, events) {
      var tags = container || tagField.find(".tag-container");
      tags.empty();
      values.map(function(tag, index) {
        events && events.render && events.render(tag);
        var a = $(
          '<a id="' +
            tag._id +
            '" href="/remove-tag"><label>' +
            tag.name +
            "</label><span>+</span></a>"
        );
        a.click(function(e) {
          e.preventDefault();
          values.splice(index, 1);
          container && updateTags(container, events);
          updateTags(null, events);
          events && events.click && events.click(tag);
          return false;
        });
        tags.append(a);
      });
      search.data("value", values);
    };
    var renderAllTags = function() {
      var allTags = $(
        '<a href="/actvity-tags" class="all-tags">View all tags</a>'
      );
      allTags.click(function(e) {
        e.preventDefault();
        $.ajax({
          url: "/libraries/tags/list",
          method: "get",
          success: function(d, s, x) {
            var content = $(d);
            content.find(".close").click(function(e) {
              e.preventDefault();
              Shared.hideOverlay(null, content.closest(".overlay"));
              return false;
            });
            content.find(".tags > a").click(function(e) {
              e.preventDefault();
              var tag = $(this).data("value");
              if ($(this).hasClass("selected")) {
                content.find(".added #" + tag._id).trigger("click");
                $(this).removeClass("selected");
              } else {
                values.push(tag);
                $(this).addClass("selected");
              }
              updateTags(content.find(".tag-container"), {
                click: function(tag) {
                  content.find("#" + tag._id).removeClass("selected");
                }
              });
              updateTags();
              return false;
            });
            updateTags(content.find(".tag-container"), {
              render: function(tag) {
                content.find("#" + tag._id).addClass("selected");
              },
              click: function(tag) {
                content.find("#" + tag._id).removeClass("selected");
              }
            });
            Shared.showOverlay({
              content: content
            });
          }
        });
        return false;
      });
      tagField.prepend(allTags);
    };
    search.addClass("has-search-events");
    search.keyup(function(e) {
      if (!$(this).val()) {
        resultContainer && resultContainer.remove();
        resultContainer = null;
        return;
      }

      if (
        ["16", "17", "18", "35", "36", "37", "38", "39", "40", "45"].includes(
          e.keyCode.toString()
        )
      )
        return false;

      $.ajax({
        url: "/libraries/tags/search?search=" + $(this).val(),
        method: "get",
        success: function(d, s, x) {
          if (!resultContainer) {
            resultContainer = $('<ul class="search-results" />');
            search.after(resultContainer);
          }

          resultContainer.empty();

          if (!d || !d.length)
            return resultContainer.append("<p>No tags found</p>");

          d.map(function(tag) {
            var item = $(
              '<li><a href="/tag/' +
                tag.name.toLowerCase().replace(/\s/g, "-") +
                '" tabIndex="-1">' +
                tag.name +
                "</a></li>"
            );
            item
              .find("a")
              .mousedown(function(e) {
                wrapper.addClass("no-shrink");
                values.push(tag);
                setTimeout(function() {
                  search.focus();
                  wrapper.removeClass("no-shrink");
                }, 100);
                updateTags();
              })
              .click(function(e) {
                e.preventDefault();
                return false;
              });
            resultContainer.append(item);
          });
        }
      });
    });
    search.keydown(function(e) {
      if (!resultContainer) return;

      var selectItem = function(direction) {
        var current = resultContainer.find("a.active").parent();
        var allItems = resultContainer.find("li");

        current && current.length && current.find("a").removeClass("active");

        if (direction === 1 && !current.length)
          allItems
            .eq(0)
            .find("a")
            .addClass("active");
        else if (
          direction === 1 &&
          current.length &&
          allItems.index(current) < allItems.length - 1
        )
          current
            .next("li")
            .find("a")
            .addClass("active");
        else if (
          direction === 1 &&
          current.length &&
          allItems.index(current) === allItems.length - 1
        )
          allItems
            .eq(0)
            .find("a")
            .addClass("active");
        else if (direction === -1 && !current.length)
          allItems
            .eq(allItems.length - 1)
            .find("a")
            .addClass("active");
        else if (
          direction === -1 &&
          current.length &&
          allItems.index(current) > 0
        )
          current
            .prev("li")
            .find("a")
            .addClass("active");
        else if (
          direction === -1 &&
          current.length &&
          allItems.index(current) === 0
        )
          allItems
            .eq(allItems.length - 1)
            .find("a")
            .addClass("active");

        return false;
      };

      switch (e.keyCode) {
        case 13: //enter
          resultContainer.find("a.active").trigger("mousedown");
          clear();
          return false;
        case 32: //space
          resultContainer.find("a.active").trigger("mousedown");
          clear();
          return false;
        case 38: //up
          return selectItem(-1);
        case 40: //down
          return selectItem(1);
      }

      if (
        ["8", "16", "17", "18", "35", "36", "37", "39", "46", "45"].includes(
          e.keyCode.toString()
        )
      )
        return true;

      if (!/[a-zA-Z0-9\s\-]+/.test(String.fromCharCode(e.keyCode)))
        return false;

      return true;
    });
    search.blur(function() {
      resultContainer && resultContainer.addClass("out");
      setTimeout(function() {
        clear();
      }, 100);
    });
    updateTags();
    renderAllTags();
  };

  var toggleField = function() {
    var wrapper = $(this).closest(".toggle-wrapper");
    $(this).addClass("has-events");
    var input = wrapper.find("input");
    input.val(wrapper.find(".active").text());
    $(this).click(function() {
      input.val($(this).text());
      if ($(this).hasClass("active")) return;
      $(this)
        .closest(".toggle-wrapper")
        .find("button.active")
        .removeClass("active");
      $(this).addClass("active");
    });
  };

  var checkboxField = function() {
    var wrapper = $(this);
    wrapper.addClass("has-events");
    var fauxInput = $("<a class='faux-input' href='javascript:void(0);' />");
    wrapper.prepend(fauxInput);
    var label = wrapper.find("label");
    var currentInput = wrapper.find("input");
    var input = $('<input type="text" />');
    input.attr("id", currentInput.attr("id"));
    input.attr("className", currentInput.attr("className"));
    currentInput.replaceWith(input);
    input = wrapper.find("input");
    input.val(wrapper.hasClass("checked"));

    if (wrapper.hasClass("checked")) fauxInput.addClass("fa fa-check");

    var toggle = function(e) {
      if (!wrapper.hasClass("checked")) {
        input.val("true");
        wrapper.addClass("checked");
        fauxInput.addClass("fa fa-check");
      } else {
        input.val("false");
        wrapper.removeClass("checked");
        fauxInput.removeClass("fa fa-check");
      }

      input.trigger("change");
    };
    label.click(toggle);
    fauxInput.click(toggle);
  };

  var telephoneField = function() {
    var fieldWrapper = $(this).closest(".field-wrapper");
    var hasValue = function() {
      var hasValue = false;
      fieldWrapper.find("input").each(function() {
        hasValue = hasValue || ($(this).val() ? true : false);
      });
      return hasValue;
    };
    $(this).addClass("has-events");
    fieldWrapper.find("input, select").focus(function() {
      fieldWrapper.addClass("focus");
    });
    fieldWrapper.find("input, select").blur(function() {
      fieldWrapper[hasValue() ? "addClass" : "removeClass"]("has-value");
      fieldWrapper.removeClass("focus");
    });
    fieldWrapper.find("select").change(function() {
      fieldWrapper.find("input:first").val($(this).val());
    });
    fieldWrapper
      .find("select")
      .bind("focus", function(e) {
        fieldWrapper.find("input:first").attr("placeholder", "+00");
      })
      .bind("blur", function(e) {
        fieldWrapper.find("input:first").removeAttr("placeholder");
      });
    fieldWrapper.find("input:last").keydown(validateNumber);
    fieldWrapper
      .find("input:last")
      .bind("focus", function(e) {
        $(this).val(
          $(this)
            .val()
            .replace(/\-/g, "")
        );
        $(this).attr("placeholder", "00-000-0000");
      })
      .bind("blur", function(e) {
        $(this).removeAttr("placeholder");

        if ($(this).val().length <= 7) return;

        var cleanedVal = $(this)
          .val()
          .replace(/\s|\(|\)|\-/g, "");

        if (cleanedVal[0] === "0") cleanedVal = cleanedVal.substring(1);

        var val = cleanedVal.split("").reverse();
        var newVal = []
          .concat(val.slice(0, 4))
          .concat(["-"])
          .concat(val.slice(4, 7))
          .concat(["-"])
          .concat(val.slice(7));
        $(this).val(newVal.reverse().join(""));
      })
      .bind("paste", function(e) {
        validateNumber({
          ctrlKey: true,
          which: "V",
          preventDefault: e.preventDefault
        });
      });
  };

  Shared.showOverlay = function(args) {
    var overlay = $('<div class="overlay" />');

    if (!args.blockClose) overlay.click(Shared.hideOverlay);

    args.content.addClass("overlay-content");
    $("body").append(overlay);
    overlay.append(args.content);
    args.content.click(function(e) {
      e.stopPropagation();
    });
    args.callback && args.callback();
    Shared.inputFields();
    setTimeout(function() {
      $(".wrapper").addClass("mask");
      overlay.addClass("show");
      args.content.addClass("show");
    }, 100);
  };

  Shared.hideOverlay = function(e, ctx) {
    var overlay = ctx || $(this);
    var content = overlay.find(".overlay-content");
    content.removeClass("show");
    overlay.removeClass("show");

    setTimeout(function() {
      content.remove();
      overlay.remove();
    }, 350);
  };

  Shared.inputFields = function(ctx) {
    var elem = ctx || $("body");
    elem
      .find(
        ".field-wrapper:not(.telephone) input:not(.has-events), .field-wrapper textarea:not(.has-events), .field-wrapper:not(.telephone) select:not(.has-events)"
      )
      .each(validations);
    elem
      .find(".field-wrapper.telephone select:not(.has-events)")
      .each(telephoneField);
    elem.find(".activity-tags:not(.has-search-events)").each(activityTags);
    elem.find(".toggle-wrapper button:not(.has-events)").each(toggleField);
    elem.find(".checkbox-option:not(.has-events)").each(checkboxField);
    elem.find(".photo-upload:not(.has-events)").each(uploadField);
  };

  Shared.photoUpload = function(args) {
    var field = $(
      '<div class="photo-upload"><a><span class="plus">+</span></a></div>'
    );
    field.addClass(args.classes);

    if (args.data && args.data.length) {
      for (var d = 0; d < args.data.length; d++) {
        var data = args.data[d];
        field.data(data.key, data.value);
      }
    }

    if (args.onUpload) field.on("boredpass.upload", args.onUpload);

    if (args.onDelete) field.on("boredpass.delete", args.onDelete);

    field.each(uploadField);
    return field;
  };

  Shared.confirm = function(args) {
    var close = function() {
      box.addClass("out");
      overlay.addClass("out");
      setTimeout(function() {
        box.remove();
        overlay.remove();
      }, 200);
    };
    var overlay = $('<div class="confirm-overlay out" />');
    var box = $('<div class="confirm-box out" />');
    box.append("<p>" + args.message + "</p>");
    var positive = $(
      '<button class="positive">' + args.positive.text + "</button>"
    );
    positive.click(function() {
      if (!args.positive.click || args.positive.click()) close();
    });
    var negative = args.negative
      ? $('<button class="negative">' + args.negative.text + "</button>")
      : null;
    negative &&
      negative.click(function() {
        if (!args.negative.click || args.negative.click()) close();
      });
    var buttons = $('<div class="buttons" />');
    negative && buttons.append(negative);
    buttons.append(positive);
    box.append(buttons);
    $("body").append(box);
    $("body").append(overlay);
    setTimeout(function() {
      box.removeClass("out");
      overlay.removeClass("out");
    }, 50);
  };

  Shared.location = function(args) {
    if (!navigator.geolocation) args && args.callback();

    return navigator.geolocation.getCurrentPosition(
      function(position) {
        args && args.callback(position);
      },
      function(err) {
        args && args.callback();
      }
    );
  };

  Shared.scrollableStrip = function() {
    $(".scrollable-container").each(function() {
      var scrollableContainer = $(this);
      var breakpoints = scrollableContainer
        .data("breakpoints")
        .split(",")
        .map(function(bp) {
          var parts = bp.split(":");
          return {
            size: parseInt(parts[0], 10),
            numVisible: parseInt(parts[1], 10)
          };
        });
      var navButtons = scrollableContainer.find(".next, .prev");
      var nextButton = scrollableContainer.find(".next");
      var prevButton = scrollableContainer.find(".prev");
      var scrollableItems = scrollableContainer.find(".scrollable");
      var numVisible = breakpoints[0].numVisible;
      var count = scrollableItems.length;
      var currentScroll = 0;
      scrollableContainer.data("current-scroll", currentScroll);

      var setNumVisible = function() {
        var getNum = function() {
          for (var i = 0; i < breakpoints.length; i++) {
            if ($("body").width() > breakpoints[i].size) {
              numVisible = breakpoints[i].numVisible;
              return;
            }
          }

          numVisible = 1;
        };
        getNum();
        navButtons.removeClass("hidden");
        numVisible >= count && navButtons.addClass("hidden");
        currentScroll <= 0 && prevButton.addClass("hidden");
        count - numVisible <= currentScroll && nextButton.addClass("hidden");
      };

      var doScroll = function(factor) {
        currentScroll = parseInt(
          scrollableContainer.data("current-scroll"),
          10
        );
        scrollableContainer.data(
          "current-scroll",
          factor > 0 ? ++currentScroll : --currentScroll
        );
        scrollableItems.css(
          "transform",
          "translateX(" + -currentScroll * 100 + "%)"
        );
        nextButton[
          count - numVisible > currentScroll ? "removeClass" : "addClass"
        ]("hidden");
        prevButton[currentScroll > 0 ? "removeClass" : "addClass"]("hidden");
      };

      navButtons.click(function(e) {
        e.preventDefault();

        if ($(this).hasClass("hidden")) return false;

        setNumVisible();
        doScroll($(this).hasClass("next") ? 1 : -1);
        return false;
      });

      $(window).resize(setNumVisible);
      setNumVisible();
    });
  };

  Shared.scrollableStrip();
});
