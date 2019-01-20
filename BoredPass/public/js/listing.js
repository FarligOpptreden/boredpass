$(document).ready(function () {
    var numVisible = 5;
    var count = $(".photos > div > div > .photo").length;
    var currentScroll = 0;

    var setNumVisible = function (startup) {
        var getNum = function () {
            if ($("body").width() > 670)
                return (function () { numVisible = 5; })();

            if ($("body").width() > 550)
                return (function () { numVisible = 4; })();

            if ($("body").width() > 400)
                return (function () { numVisible = 2; })();

            numVisible = 1;
        }
        getNum();
        $(".photos .next, .photos .prev").removeClass("hidden");
        numVisible >= count && $(".photos .next, .photos .prev").addClass("hidden");
        currentScroll <= 0 && $(".photos .prev").addClass("hidden");
        count - numVisible <= currentScroll && $(".photos .next").addClass("hidden");
    };

    var doScroll = function (factor) {
        currentScroll = parseInt($(".photos > div > div").data("current-scroll"), 10);
        $(".photos > div > div").data("current-scroll", (factor > 0 ? ++currentScroll : --currentScroll));
        $(".photos .photo").css("transform", "translateX(" + (-currentScroll * 100) + "%)");

        if (count - numVisible > currentScroll)
            $(".photos .next").removeClass("hidden");
        else
            $(".photos .next").addClass("hidden");

        if (currentScroll > 0)
            $(".photos .prev").removeClass("hidden");
        else
            $(".photos .prev").addClass("hidden");
    };

    var doLightbox = function (photo) {
        if ($(".light-box").length)
            return;

        var lightBox = $("<div class=\"light-box\" />");
        var prev = $("<a href=\"prev-photo\" class=\"prev fa fa-angle-left\" />");
        var next = $("<a href=\"next-photo\" class=\"next fa fa-angle-right\" />");
        var close = $("<a href=\"close\" class=\"close\">+</a>");
        
        var allPhotos = $(".listing-section.photos .photo");
        var photoIndex = allPhotos.index(photo.closest(".photo"));
        var index = 0;
        allPhotos.each(function () {
            var photo = $("<div class=\"photo\" />");
            photo.css("background-image", $(this).find("a").css("background-image"));
            index++ !== photoIndex && photo.addClass("hidden");
            lightBox.append(photo);
        });
        photoIndex === 0 && prev.addClass("hidden");
        photoIndex === allPhotos.length - 1 && next.addClass("hidden");

        prev.click(function (e) {
            e.preventDefault();
            if (photoIndex === 0)
                return false;

            var currentPhoto = lightBox.find(".photo:not(.hidden)");
            var prevPhoto = currentPhoto.prev(".photo");
            currentPhoto.addClass("hidden");
            prevPhoto.removeClass("hidden");
            photoIndex--;
            (photoIndex === 0 && prev.addClass("hidden")) || prev.removeClass("hidden");
            (photoIndex === allPhotos.length - 1 && next.addClass("hidden")) || next.removeClass("hidden");
            return false;
        });
        next.click(function (e) {
            e.preventDefault();
            if (photoIndex === allPhotos.length - 1)
                return false;

            var currentPhoto = lightBox.find(".photo:not(.hidden)");
            var nextPhoto = currentPhoto.next(".photo");
            currentPhoto.addClass("hidden");
            nextPhoto.removeClass("hidden");
            photoIndex++;
            (photoIndex === 0 && prev.addClass("hidden")) || prev.removeClass("hidden");
            (photoIndex === allPhotos.length - 1 && next.addClass("hidden")) || next.removeClass("hidden");
            return false;
        });
        close.click(function (e) {
            e.preventDefault();
            lightBox.remove();
            return false;
        });

        lightBox.click(function () {
            close.trigger("click");
        });
        lightBox.append(close);
        lightBox.append(prev);
        lightBox.append(next);
        $("body").append(lightBox);
    };

    $(".photos .next, .photos .prev").click(function (e) {
        e.preventDefault();

        if ($(this).hasClass("hidden"))
            return;

        setNumVisible();
        doScroll($(this).hasClass("next") ? 1 : -1);
        return false;
    });

    $(window).resize(setNumVisible);

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

    $(".listing-section .photo a").click(function () {
        doLightbox($(this));
    });

    $(".stars > a").hover(function () {
        $(this).prevAll("a").addClass("color");
        $(this).nextAll("a").removeClass("color");
        $(this).addClass("color");
    }).click(function (e) {
        e.preventDefault();
        return alert("Not implemented yet") && false;
        });
    $(".stars").hover(null, function () {
        $(this).find("a").removeClass("color");
    });
});