$(document).ready(function () {
    $("#showstats").click(function () {
        if ($(this).text() == "Show") {
            $(this).text("Hide");
            $(".statistics .statistic").removeClass("hidden");
            return;
        }

        $(this).text("Show");
        $(".statistics .statistic").addClass("hidden");
    });
    Shared.location({
        callback: function (position) {
            $.ajax({
                url: position ? '/?lat=' + position.coords.latitude + '&lng=' + position.coords.longitude : '/?all=true',
                method: 'get'
            }).done(function (html) {
                $(".listings").replaceWith(html);
            });
        }
    });
});