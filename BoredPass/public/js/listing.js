var Listing = {};

$(document).ready(function () {
    var numVisible = 5;
    var setNumVisible = function () {
        if ($("body").width() > 670) {
            numVisible = 5;
            return;
        }
        if ($("body").width() > 550) {
            numVisible = 4;
            return;
        }
        if ($("body").width() > 400) {
            numVisible = 2;
            return;
        }
        numVisible = 1;
    };
    var doScroll = function (factor) {
        console.log(numVisible);
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
        setNumVisible();
        doScroll($(this).hasClass("next") ? 1 : -1);
        return false;
    });
    $(window).resize(function () {
        setNumVisible();
    });
});