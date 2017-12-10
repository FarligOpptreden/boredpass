var Listing = {};

$(document).ready(function () {
    var numVisible = 5;
    var count = $(".photos > div > div > .photo").length;
    var setNumVisible = function () {
        var getNum = function () {
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
        }
        getNum();
        $(".photos .next, .photos .prev").removeClass("hidden");
        if (numVisible >= count)
            $(".photos .next, .photos .prev").addClass("hidden");
    };
    var doScroll = function (factor) {
        var currentScroll = parseInt($(".photos > div > div").data("current-scroll"), 10);
        $(".photos > div > div").data("current-scroll", (factor > 0 ? ++currentScroll : --currentScroll));
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
    setNumVisible();
    $("a.delete").click(function (e) {
        e.preventDefault();
        var type = $(this).hasClass("listing") ? "listing" : "activity";
        var typeName = type === "listing" ? "listing" : "experience";
        var url = $(this).attr("href");
        Shared.confirm({
            message: "Are you sure you want to delete this " + typeName + "?",
            positive: {
                text: "Yes",
                click: function () {
                    $.ajax({
                        url: url,
                        method: "delete",
                        dataType: "json"
                    }).done(function (data) {
                        document.location.href = "/";
                    });
                    return true;
                }
            },
            negative: {
                text: "No"
            }
        });
        return false;
    });
});