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
        if (anchor.hasClass("has-image")) {
            anchor.find("span").remove();
            anchor.append("<span class=\"close\">+</span>");
        }
        anchor.bind("click", function () {
            if (anchor.hasClass("has-image") && !wrapper.data("allow-change")) {
                wrapper.trigger("boredpass.delete");
                wrapper.remove();
                return;
            }
            input.trigger("click");
        });
    };
    var activityTags = function () {
        var search = $(this);
        var wrapper = search.closest(".field-wrapper");
        search.focus(function () {
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
                            if (wrapper.find(".tag-container > ." + tag.icon).length)
                                anchor.addClass("selected");
                            anchor.click(function () {
                                console.log(search.next(".tag-container").length);
                                search.addClass("keep-open");
                                var operation = anchor.hasClass("selected") ? "removeClass" : "addClass";
                                anchor[operation]("selected");
                                if (operation === "removeClass")
                                    wrapper.find(".tag-container > ." + tag.icon).remove();
                                else {
                                    var addedTag = $("<span class=\"tag icon activity colour " + tag.icon + "\">" + tag.name + "</span>");
                                    addedTag.data("tag", tag);
                                    wrapper.find(".tag-container").append(addedTag);
                                }
                                search.focus();
                                var addedTags = "";
                                wrapper.find(".tag-container > span").each(function () {
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
        search.blur(function () {
            setTimeout(function () {
                if (search.hasClass("keep-open"))
                    return;
                search.next(".tag-search").addClass("hidden");
            }, 150);
        });
        search.next(".tag-container").click(function () {
            search.focus();
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
        $(".activity-tags:not(.has-events)").each(activityTags);
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
            if ($(this).hasClass("mandatory")) {
                if ($(this).closest(".field-wrapper").hasClass("no-grow")) {
                    var field = $(this);
                    field.blur(function () {
                        setTimeout(function () {
                            if (field.val())
                                field.closest(".field-wrapper").removeClass("error");
                            else
                                field.closest(".field-wrapper").addClass("error");
                        }, 100);
                    });
                }
                $(this).keyup(function () {
                    if ($(this).val())
                        $(this).closest(".field-wrapper").removeClass("error");
                    else
                        $(this).closest(".field-wrapper").addClass("error");
                });
            }
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
    Shared.confirm = function (args) {
        var close = function () {
            box.addClass("out");
            overlay.addClass("out");
            setTimeout(function () {
                box.remove();
                overlay.remove();
            }, 200);
        };
        var overlay = $("<div class=\"confirm-overlay out\" />");
        var box = $("<div class=\"confirm-box out\" />");
        box.append("<p>" + args.message + "</p>");
        var positive = $("<button class=\"positive\">" + args.positive.text + "</button>");
        positive.click(function () {
            if (!args.positive.click || args.positive.click())
                close();
        });
        var negative = $("<button class=\"negative\">" + args.negative.text + "</button>");
        negative.click(function () {
            if (!args.negative.click || args.negative.click())
                close();
        });
        var buttons = $("<div class=\"buttons\" />");
        buttons.append(negative);
        buttons.append(positive);
        box.append(buttons);
        $("body").append(box);
        $("body").append(overlay);
        setTimeout(function () {
            box.removeClass("out");
            overlay.removeClass("out");
        }, 50);
    };
});