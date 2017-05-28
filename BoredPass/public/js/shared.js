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
        $(".field-wrapper input:not(.has-events)").each(function () {
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
    };
});