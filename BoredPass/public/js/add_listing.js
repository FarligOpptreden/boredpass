var Listings = {};

$(document).ready(function () {
    var content = null;

    $("nav a.add, #footer a.add-listing").click(function (e) {
        e.preventDefault();
        $.ajax({
            url: "/listings/add/wizard",
            method: "get",
            success: function (d, s, x) {
                content = $(d);
                Listings.create();
                Shared.showOverlay({
                    content: content
                });
            }
        });
    });

    Listings.create = function () {
        content.find(".close").click(function (e) {
            e.preventDefault();
            $(".overlay").trigger("click");
            return false;
        });
        content.find("form").on("submit", function onFormSubmit() {
            return false;
        });
        var wizardForms = content.find(".wizard-content form");
        var progress = function (form, factor) {
            var stepIndex = wizardForms.index(form) + (factor > 0 ? -1 : 1);
            var stepIndicator = $(".wizard-steps > nav > a").eq(wizardForms.index(form));
            stepIndicator.removeClass("active");
            if (!stepIndicator.hasClass("completed"))
                stepIndicator.addClass("completed");
            content.find(".wizard-steps > nav > a").eq(stepIndex).addClass("active");
            form.removeClass("active");
            var newForm = form[factor > 0 ? "prev" : "next"]("form");
            newForm.addClass("active");
        };
        content.find("button.next, button.prev").click(function () {
            var prefix = "";
            if (content.find(".wizard-content"))
                prefix = ".active ";
            content.find(prefix + ".mandatory").trigger("keyup");
            if (content.find(prefix + ".error").length) {
                content.find(prefix + ".error:first").find("input, textarea").focus();
                content.addClass("no-no");
                setTimeout(function () {
                    content.removeClass("no-no");
                }, 650);
                return false;
            }
            var form = $(this).closest("form");
            var factor = $(this).hasClass("prev") ? 1 : -1;
            progress(form, factor);
            content.find(".wizard-content").scrollTop(0);
        });
        content.find("button.finish").click(function () {
            var listing = {
                name: content.find("#businessname").val(),
                description: content.find("#description").val(),
                tags: content.find(".activity-tags").data("value"),
                address: content.find("#address").val(),
                website: content.find("#website").val(),
                owner: content.find("#yourbusiness").val().toLowerCase() === "yes",
                telephone: content.find("#telephone-code").val() + content.find("#telephone").val(),
                cellphone: content.find("#cellphone-code").val() + content.find("#cellphone").val(),
                email: content.find("#email").val(),
                social: {
                    facebook: content.find("#social-facebook").val(),
                    twitter: content.find("#social-twitter").val(),
                    google: content.find("#social-google").val(),
                    instagram: content.find("#social-instagram").val(),
                    pinterest: content.find("#social-pinterest").val(),
                    youtube: content.find("#social-youtube").val()
                },
                logo: (function () {
                    var upload = content.find("#logo-upload .has-image").data("upload");
                    if (!upload)
                        return null;
                    return {
                        fileId: upload.fileId,
                        fileType: upload.fileType
                    }
                })(),
                photos: (function () {
                    var arr = [];
                    content.find(".add-photos .photo-upload .has-image").each(function () {
                        var photo = $(this).data("upload");
                        if (!photo)
                            return;
                        arr.push({
                            fileId: photo.fileId,
                            fileType: photo.fileType
                        });
                    });
                    return arr;
                })(),
                facilities: (function () {
                    var arr = [];
                    content.find("#add_listing_3 .facility").each(function () {
                        var selected = $(this).find(".options .active");
                        if (selected.text() === "No")
                            return;
                        arr.push($(this).data("facility"));
                    });
                    return arr;
                })(),
                banner: content.find(".edit-banner").data("banner"),
                customBanner: content.find(".edit-banner").data("custom-banner")
            };
            $.ajax({
                url: "/listings/add",
                method: "post",
                contentType: "application/json",
                data: JSON.stringify(listing),
                success: function (d, s, x) {
                    content.find(".wizard-content").empty().append(d);
                    content.find(".wizard-content").scrollTop(0);
                    var nav = content.find(".wizard-steps nav");
                    nav.find("a").remove();
                    nav.append("<a class=\"fas fa-check active\" />");
                }
            });
        });
        content.find(".social a").click(function () {
            var linkList = $(this).closest(".links");
            var linkIndex = linkList.find("a").index($(this));
            linkList.find(".active").removeClass("active");
            $(this).addClass("active");
            linkList.nextAll("input:not(.hidden)").addClass("hidden");
            linkList.nextAll("input").eq(linkIndex).removeClass("hidden");
        });
        content.find(".social input").on("keyup", function () {
            var inputIndex = content.find(".social").find("input").index($(this));
            var operation = $(this).val() ? "addClass" : "removeClass";
            content.find(".social .links a").eq(inputIndex)[operation]("has-value");
        });
        content.find(".add-activity").click(function () {
            window.location.href = $(this).data("link");
        });
        var onUpload = function () {
            var field = Shared.photoUpload({
                data: [{
                    key: "url",
                    value: $(this).data("url")
                }],
                onUpload: onUpload
            });
            $(this).after(field);
        };
        content.find(".add-photos .photo-upload").on("boredpass.upload", onUpload);
        content.find(".edit-banner").click(function (e) {
            e.preventDefault();
            $.ajax({
                url: "/libraries/banners/list",
                method: "get",
                success: function (d, s, x) {
                    var c = $(d);
                    c.find(".close").click(function (e) {
                        e.preventDefault();
                        Shared.hideOverlay(null, c.closest(".overlay"));
                        return false;
                    });
                    c.find(".banners a").each(function () {
                        var image = $(this).data("value");
                        var url = "url(/images/banners/" + image + ")";
                        image === $("section.banner").data("banner") && $(this).addClass("selected");
                        $(this).css("background-image", url);
                        $(this).click(function (e) {
                            e.preventDefault();
                            content.find(".edit-banner")
                                .data("banner", image)
                                .data("custom-banner", null)
                                .css("background-image", url);
                            Shared.hideOverlay(null, c.closest(".overlay"));
                            return false;
                        });
                    });
                    c.find(".photo-upload a").data("uploaded", function (d) {
                        content.find(".edit-banner")
                            .data("banner", null)
                            .data("custom-banner", d.location)
                            .css("background-image", "url(" + d.location + ")");
                        Shared.hideOverlay(null, c.closest(".overlay"));
                    });
                    Shared.showOverlay({
                        content: c
                    });
                }
            });
            return false;
        });
        content.find("#businessname").blur(function (e) {
            var fieldWrapper = $(this).closest(".field-wrapper");
            $.ajax({
                url: "/listings/duplicates/" + encodeURIComponent($(this).val()),
                method: "get",
                success: function (d, s, x) {
                    fieldWrapper.next(".duplicates").remove();

                    if (!d || !d.success || !d.listings || !d.listings.length)
                        return;

                    var dupes = $("<div class=\"duplicates\"><p>We found some possible duplicate listings. Want to confirm before you add this one?</p></div>");

                    d.listings.map(function (l) {
                        dupes.append($("<a />", {
                            href: "/listings/" + l._id,
                            target: "_blank",
                            html: l.name + "<span>" + l.formatted_address + "</span><i class=\"fa fa-angle-right\" />"
                        }));
                    });

                    fieldWrapper.after(dupes);
                }
            });
        });
    };
});