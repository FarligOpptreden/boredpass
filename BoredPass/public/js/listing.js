var Listing = {};

$(document).ready(function () {
    var doScroll = function (factor, numVisible) {
        var count = $(".photos > div > .photo").length;
        var currentScroll = parseInt($(".photos > div").data("current-scroll"), 10);
        $(".photos > div").data("current-scroll", (factor > 0 ? ++currentScroll : --currentScroll));
        $(".photos .photo").css("transform", "translateX(" + (-currentScroll * 100) + "%)");
        if (count - numVisible > currentScroll) {
            $(".photos .next").removeClass("hidden");
        } else {
            $(".photos .next").addClass("hidden");
        }
        if (currentScroll > 0) {
            $(".photos .prev").removeClass("hidden");
        }
        else {
            $(".photos .prev").addClass("hidden");
        }
    };
    $(".photos .next, .photos .prev").click(function (e) {
        e.preventDefault();
        if ($(this).hasClass("hidden"))
            return;
        doScroll($(this).hasClass("next") ? 1 : -1, 5);
        return false;
    });
});