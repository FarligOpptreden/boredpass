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
    $("#header a.sign-in").click(function (e) {
        e.preventDefault();
        $.ajax({
            url: "/secure/sign-in",
            method: "get",
            success: function (d, s, x) {
                var content = $(d);
                Shared.showOverlay({
                    content: content
                });
            }
        }); 
    });
    $(".toolbar").each(function () {
        $(this).addClass("show");
        $("#header > nav").addClass("has-toolbar");
    });
});