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
        $("#post-listing").click(function () {
            $(".mandatory").trigger("keyup");
            if ($(".error").length) {
                $(".error:first").find("input, textarea").focus();
                return false;
            }
            var listing = {
                name: $("#listing-name").val(),
                description: $("#listing-description").val(),
                address: $("#listing-address").val(),
                website: $("#listing-website").val(),
                telephone: $("#listing-telephone").val(),
                cellphone: $("#listing-cellphone").val(),
                email: $("#listing-email").val(),
                logo: (function () {
                    var upload = $(".photo-upload.logo .has-image");
                    if (upload && upload.length)
                        return upload.data("upload");
                    return null;
                })(),
                photos: (function () {
                    var arr = [];
                    $(".photos .photo-upload .has-image").each(function () {
                        var photo = $(this).data("upload");
                        arr.push({
                            fileId: photo.fileId,
                            fileType: photo.fileType
                        });
                    });
                    return arr;
                })(),
                tags: (function () {
                    var tags = [];
                    $(".tag-container > span").each(function () {
                        tags.push($(this).data("tag"));
                    });
                    return tags;
                })(),
                facilities: (function () {
                    var facilities = [];
                    $(".facilities .facility.selected").each(function () {
                        facilities.push($(this).data("facility"));
                    });
                    return facilities;
                })()
            };
            var mode = $("#mode").val();
            $.ajax({
                url: "/listings/" + $("#listing-id").val() + "/edit?v=" + new Date().getTime(),
                method: "put",
                contentType: "application/json",
                data: JSON.stringify(listing),
                success: function (d, s, x) {
                    window.location.href = "/listings/" + d.id;
                }
            });
        });
    })();
});