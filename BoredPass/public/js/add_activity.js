$(document).ready(function () {
    $("#add-activity > a").click(function () {
        $.ajax({
            url: "/activity/add",
            method: "get",
            dataType: "html"
        }).done(function (data) {
            var overlay = $(data);
            Shared.showOverlay({
                content: overlay,
                callback: function () {
                    activityEvents();
                    overlay.find(".close").click(function () {
                        Shared.hideOverlay();
                    });
                }
            });
        });
    });
    var activityEvents = function () {
        $(".add-activity .next, .add-activity .prev").click(function () {
            var current = $(".step:not(.shift)");
            var prev = current.prevAll(".step");
            var next = current.nextAll(".step");
            var direction = $(this).hasClass("next") ? "next" : "prev";
            var activeBreadcrumb = $(".add-activity .breadcrumb a.active");
            activeBreadcrumb.removeClass("active");
            if (direction === "next")
                activeBreadcrumb.next("a").addClass("active");
            else
                activeBreadcrumb.prev("a").addClass("active");
            current.addClass("shift " + (direction === "next" ? "left1" : "right1"));
            prev.each(function () {
                var amount = $(this)[0].className.replace(/step|shift|left/g, "");
                amount = parseInt(amount.trim());
                $(this).removeClass("shift left" + amount);
                if (direction === "prev" && amount == 1)
                    return;
                $(this).addClass("shift left" + (direction === "prev" ? --amount : ++amount));
            });
            next.each(function () {
                var amount = $(this)[0].className.replace(/step|shift|right/g, "");
                amount = parseInt(amount.trim());
                $(this).removeClass("shift right" + amount);
                if (direction === "next" && amount == 1)
                    return;
                $(this).addClass("shift right" + (direction === "next" ? --amount : ++amount));
            });
        });
        $(".add-activity .done").click(function () {
            $(this).closest(".overlay-content").find(".close").trigger("click");
        });
    };
    setTimeout(function () {
        $("#add-activity > a").trigger("click");
    }, 500);
});