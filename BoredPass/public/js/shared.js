var Shared = {};

$(document).ready(function () {
    var validations = function () {
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
            if ($(this).closest(".tag-field").length) {
                var field = $(this);
                field.keyup(function () {
                    if (field.data("value") && field.data("value").length)
                        field.closest(".field-wrapper").removeClass("error");
                    else
                        field.closest(".field-wrapper").addClass("error");
                });
            }
            else
                $(this).keyup(function () {
                    if ($(this).val())
                        $(this).closest(".field-wrapper").removeClass("error");
                    else
                        $(this).closest(".field-wrapper").addClass("error");
                });
        }
        $(this).hasClass("validate-number") && $(this).keydown(function (e) {
            if ((e.keyCode !== 32 && e.keyCode <= 46) || (e.keyCode >= 112 && e.keyCode <= 145))
                return true;
            var keyCode = e.which;
            var val;
            if (keyCode >= 96)
                keyCode -= 48;
            var keyVal = String.fromCharCode(keyCode);
            if (!/\d/.test(keyVal)) {
                e.preventDefault();
                return false;
            }
            var fld = $(this);
            if (fld.attr("type") === "number") {
                var min = $(this).attr("min");
                var max = $(this).attr("max");
                val = parseFloat($(this).val() + parseFloat(keyVal));
                if (val < min || val > max) {
                    e.preventDefault();
                    return false;
                }
                return true;
            }
            var maxLength = $(this).attr("maxlength");
            val = $(this).val() + keyVal;
            if (val.length > maxLength) {
                e.preventDefault();
                return false;
            }
            return true;
        });
        $(this).hasClass("validate-email") && $(this).keyup(function () {
            var valid = /^[a-zA-Z0-9\-\.]+@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9]+){1,2}$/.test($(this).val());
            if (valid)
                $(this).closest(".field-wrapper").removeClass("error");
            else
                $(this).closest(".field-wrapper").addClass("error");
        });
    };

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
        var tagField = wrapper.closest(".tag-field");
        var resultContainer = null;
        var values = search.data("value") || [];
        var clear = function () {
            resultContainer && resultContainer.remove();
            resultContainer = null;
            search.val("");
            wrapper.removeClass("has-value");
        };
        var updateTags = function (container, events) {
            var tags = container || tagField.find(".tag-container");
            tags.empty();
            values.map(function (tag, index) {
                events && events.render && events.render(tag);
                var a = $("<a id=\"" + tag._id + "\" href=\"/remove-tag\"><label>" + tag.name + "</label><span>+</span></a>");
                a.click(function (e) {
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
        var renderAllTags = function () {
            var allTags = $("<a href=\"/actvity-tags\" class=\"all-tags\">View all tags</a>");
            allTags.click(function (e) {
                e.preventDefault();
                $.ajax({
                    url: "/libraries/tags/list",
                    method: "get",
                    success: function (d, s, x) {
                        var content = $(d);
                        content.find(".close").click(function (e) {
                            e.preventDefault();
                            Shared.hideOverlay();
                            return false;
                        });
                        content.find(".tags > a").click(function (e) {
                            e.preventDefault();
                            var tag = $(this).data("value");
                            if ($(this).hasClass("selected")) {
                                content.find(".added #" + tag._id).trigger("click");
                                $(this).removeClass("selected");
                            }
                            else {
                                values.push(tag);
                                $(this).addClass("selected");
                            }
                            updateTags(content.find(".tag-container"), {
                                click: function (tag) {
                                    content.find("#" + tag._id).removeClass("selected");
                                }
                            });
                            updateTags();
                            return false;
                        });
                        updateTags(content.find(".tag-container"), {
                            render: function (tag) {
                                content.find("#" + tag._id).addClass("selected");
                            },
                            click: function (tag) {
                                console.log(tag);
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
        search.keyup(function (e) {
            if (!$(this).val()) {
                resultContainer && resultContainer.remove();
                resultContainer = null;
                return;
            }

            if (["16", "17", "18", "35", "36", "37", "38", "39", "40", "45"].includes(e.keyCode.toString()))
                return false;

            $.ajax({
                url: "/libraries/tags/search?search=" + $(this).val(),
                method: "get",
                success: function (d, s, x) {
                    if (!resultContainer) {
                        resultContainer = $("<ul class=\"search-results\" />");
                        search.after(resultContainer);
                    }

                    resultContainer.empty();

                    if (!d || !d.length)
                        return resultContainer.append("<p>No tags found</p>");

                    d.map(function (tag) {
                        var item = $("<li><a href=\"/tag/" + tag.name.toLowerCase().replace(/\s/g, "-") + "\" tabIndex=\"-1\">" + tag.name + "</a></li>");
                        item.find("a").mousedown(function (e) {
                            wrapper.addClass("no-shrink");
                            values.push(tag);
                            setTimeout(function () {
                                search.focus();
                                wrapper.removeClass("no-shrink");
                            }, 100);
                            updateTags();
                        }).click(function (e) {
                            e.preventDefault();
                            return false;
                        });
                        resultContainer.append(item);
                    });
                }
            });
        });
        search.keydown(function (e) {
            if (!resultContainer)
                return;

            var selectItem = function (direction) {
                var current = resultContainer.find("a.active").parent();
                var allItems = resultContainer.find("li");

                current && current.length && current.find("a").removeClass("active");

                if (direction === 1 && !current.length)
                    allItems.eq(0).find("a").addClass("active");
                else if (direction === 1 && current.length && allItems.index(current) < allItems.length - 1)
                    current.next("li").find("a").addClass("active");
                else if (direction === 1 && current.length && allItems.index(current) === allItems.length - 1)
                    allItems.eq(0).find("a").addClass("active");
                else if (direction === -1 && !current.length)
                    allItems.eq(allItems.length - 1).find("a").addClass("active");
                else if (direction === -1 && current.length && allItems.index(current) > 0)
                    current.prev("li").find("a").addClass("active");
                else if (direction === -1 && current.length && allItems.index(current) === 0)
                    allItems.eq(allItems.length - 1).find("a").addClass("active");

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

            if (["8", "16", "17", "18", "35", "36", "37", "39", "46", "45"].includes(e.keyCode.toString()))
                return true;

            if (!/[a-zA-Z0-9\s\-]+/.test(String.fromCharCode(e.keyCode)))
                return false;

            return true;
        });
        search.blur(function () {
            resultContainer && resultContainer.addClass("out");
            setTimeout(function () {
                clear();
            }, 100);
        });
        updateTags();
        renderAllTags();
    };

    var toggleField = function () {
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
    };

    var checkboxField = function () {
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
    };

    Shared.showOverlay = function (args) {
        var overlay = $("<div class=\"overlay\" />");
        overlay.click(Shared.hideOverlay);
        args.content.addClass("overlay-content");
        $("body").append(overlay);
        $("body").append(args.content);
        args.callback && args.callback();
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
        $(".field-wrapper input:not(.has-events), .field-wrapper textarea:not(.has-events)").each(validations);
        $(".activity-tags:not(.has-search-events)").each(activityTags);
        $(".toggle-wrapper button:not(.has-events)").each(toggleField);
        $(".checkbox-option:not(.has-events)").each(checkboxField);
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