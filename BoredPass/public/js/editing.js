var Listing = {};

$(document).ready(function () {
    /* Shared Events */
    (function () {
        Shared.inputFields();
        var onUpload = function () {
            var field = Shared.photoUpload({
                data: [{
                    key: "url",
                    value: $(this).data("url")
                }],
                onUpload: onUpload,
                onDelete: onDelete
            });
            $(this).after(field);
        };
        var onDelete = function () { };
        $(".add-photos .photo-upload").on("boredpass.upload", onUpload);
        $(".add-photos .photo-upload").on("boredpass.delete", onDelete);
        $(".listing-section.facilities .facility").click(function () {
            if ($(this).hasClass("selected"))
                $(this).removeClass("selected")
            else
                $(this).addClass("selected");
        });
    })();
    /* Listing Events */
    (function () {
    })();
    /* Activity Events */
    (function () {
    })();
});