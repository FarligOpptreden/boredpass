var Auth = {};

$(document).ready(function () {
    var content = null;
    $("#header a.sign-in").click(function (e) {
        e.preventDefault();
        $.ajax({
            url: "/secure/sign-in",
            method: "get",
            success: function (d, s, x) {
                content = $(d);
                Auth.signIn();
                Auth.signUp();
                Auth.nav();
                Shared.showOverlay({
                    content: content
                });
            }
        });
    });
    $("#header a.sign-out").click(function (e) {
        e.preventDefault();
        $.ajax({
            url: "/secure/sign-out",
            method: "get",
            success: function (d, s, x) {
                window.location.href = '/';
            }
        });
    });
    Auth.nav = function () {
        content.find(".options a").click(function (e) {
            e.preventDefault();
            content.find(".options a.active").removeClass("active");
            content.find("form.active").removeClass("active");
            var form = content.find("form." + $(this).attr("class").trim());
            $(this).addClass("active");
            form.addClass("active");
            return false;
        });
    };
    Auth.signIn = function () {
        var signIn = content.find("form.sign-in");
        signIn.find("button").click(function (e) {
            e.preventDefault();
            $.ajax({
                url: "/secure/sign-in",
                method: "post",
                contentType: "application/json",
                data: JSON.stringify({
                    email: signIn.find("#sign-in-email").val(),
                    password: signIn.find("#sign-in-password").val()
                }),
                success: function (d, s, x) {
                    if (d && d.success)
                        window.location.href = window.location.href;
                }
            });
            return false;
        });
    };
    Auth.signUp = function () {
        var signUp = content.find("form.sign-up");
        signUp.find("button").click(function (e) {
            e.preventDefault();
            signUp.find(".mandatory").trigger("keyup");

            if (signUp.find(".error").length)
                return signUp.find(".error:first input").focus() && false;

            var user = {
                name: signUp.find("#sign-up-name-and-surname").val(),
                email: signUp.find("#sign-up-email").val(),
                password: signUp.find("#sign-up-password").val(),
                passwordConfirm: signUp.find("#sign-up-confirm-password").val()
            };

            $.ajax({
                url: "/secure/sign-up",
                method: "post",
                contentType: "application/json",
                data: JSON.stringify(user),
                success: function (d, s, x) {
                    console.log(d);
                }
            });
            return false;
        });
    };
    Auth.validatePassword = function (value) {
        return (value && value.length >= 6 && /(.*[A-Z]+.*[0-9]+.*)|(.*[0-9]+.*[A-Z]+.*)/.test(value) && true) || false;
    };
    Auth.validateConfirmPassword = function (value) {
        var signUp = content.find("form.sign-up");
        return value === signUp.find("#sign-up-password").val();
    };
});