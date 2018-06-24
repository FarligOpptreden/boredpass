$(document).ready(function () {
    $("#load-more").click(function (e) {
        e.preventDefault();
        var loadingTemplate = $(".listing.template");
        for (var i = 0; i < 12; i++) {
            var loading = loadingTemplate.clone();
            loading.removeClass("template");
            $(".buttons").before(loading);
        }
        var url = $("#load-more").attr("href");
        var urlParts = url.split("/");
        var nextPage = parseInt(urlParts[urlParts.length - 1], 10) + 12;
        $.ajax({
            url: url,
            method: 'get'
        }).done(function (html) {
            $(".buttons").before(html);
            $(".listing.loading:not(.template)").remove();

            if ($(".no-more-data").length)
                return $(".buttons").remove();
            
            urlParts.splice(urlParts.length - 1, 1);
            var nextUrl = urlParts.join("/") + "/" + nextPage;
            $("#load-more").attr("href", nextUrl);
        });
        return;
    });
});