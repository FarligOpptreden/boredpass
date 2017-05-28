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
                    overlay.find(".close").click(function () {
                        Shared.hideOverlay();
                    });
                }
            });
        });
    });
    setTimeout(function () {
        //$("#add-activity > a").trigger("click");
    }, 1000);
});