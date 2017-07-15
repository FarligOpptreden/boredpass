var BoredPass = {};

$(document).ready(function () {
    var navHeader = $("#header > nav:first");
    var navSubHeader = $("#header > nav:last");
    $(document).on("scroll", function () {
        if ($(this).scrollTop() > navSubHeader.height())
            navHeader.addClass("float");
        else
            navHeader.removeClass("float");
    });
});