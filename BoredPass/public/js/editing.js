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
        $(".edit-banner").click(function (e) {
            e.preventDefault();
            $.ajax({
                url: "/libraries/banners/list",
                method: "get",
                success: function (d, s, x) {
                    var content = $(d);
                    content.find(".close").click(function (e) {
                        e.preventDefault();
                        Shared.hideOverlay();
                        return false;
                    });
                    console.log($("section.banner").data("banner"));
                    content.find(".banners a").each(function () {
                        var image = $(this).data("value");
                        var url = "url(/images/banners/" + image + ")";
                        image === $("section.banner").data("banner") && $(this).addClass("selected");
                        $(this).css("background-image", url);
                        $(this).click(function (e) {
                            e.preventDefault();
                            $("section.banner")
                                .data("banner", image)
                                .css("background-image", url);
                            Shared.hideOverlay();
                            return false;
                        });
                    });
                    Shared.showOverlay({
                        content: content
                    });
                }
            });
            return false;
        });
        $("#post-listing").click(function (e) {
            e.preventDefault();
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
                social: {
                    facebook: $("#listing-facebook").val(),
                    twitter: $("#listing-twitter").val(),
                    google: $("#listing-google").val(),
                    instagram: $("#listing-instagram").val(),
                    pinterest: $("#listing-pinterest").val(),
                    youtube: $("#listing-youtube").val()
                },
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
                tags: $(".activity-tags").data("value"),
                facilities: (function () {
                    var facilities = [];
                    $(".facilities .facility.selected").each(function () {
                        facilities.push($(this).data("facility"));
                    });
                    return facilities;
                })(),
                banner: $("section.banner").data("banner")
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
            return false;
        });
    })();
});