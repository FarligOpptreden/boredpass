var Auth = {};

$(document).ready(function() {
  var content = null;
  $("#header a.sign-in, #footer a.sign-in, #footer a.register").click(function(
    e
  ) {
    e.preventDefault();
    Auth.openAuthModal();
  });
  $("#header a.user-profile").click(function(e) {
    e.preventDefault();
    var profile = $(this);
    $(this)
      .next(".menu-box")
      .each(function() {
        if ($(this).hasClass("open")) {
          $(this).removeClass("open");
          $("body .menu-box-cover").remove();
          return;
        }

        $(this).addClass("open");
        $(this)
          .find(".arrow-top")
          .css(
            "left",
            profile.outerWidth() > 160 ? 16 : 160 - profile.outerWidth() + 16
          );
        $(this).css(
          "margin-right",
          profile.outerWidth() > 160 ? profile.outerWidth() - 160 : 0
        );
        $("body").append(
          $("<div />", {
            class: "menu-box-cover",
            click: function(e) {
              $("#header a.user-profile").trigger("click");
            }
          })
        );
      });
  });
  $("#header a.sign-out, #footer a.sign-out").click(function(e) {
    e.preventDefault();
    $(this).closest("#header").length &&
      $("#header a.user-profile").trigger("click");
    Shared.confirm({
      message: "Are you sure you want to sign out of your account?",
      positive: {
        text: "Yes",
        click: function() {
          $.ajax({
            url: "/secure/sign-out",
            method: "get"
          }).done(function(data) {
            document.location.href = "/";
          });
          return true;
        }
      },
      negative: {
        text: "No"
      }
    });
  });
  Auth.nav = function() {
    content.find(".options a, .password-options a").click(function(e) {
      e.preventDefault();
      content
        .find(".options a.active, .password-options a")
        .removeClass("active");
      content.find("form.active").removeClass("active");
      var form = content.find(
        "form." +
          $(this)
            .attr("class")
            .trim()
      );
      $(this).addClass("active");
      form.addClass("active");
      return false;
    });
  };
  Auth.signIn = function() {
    var signIn = content.find("form.sign-in");
    content.find(".close").click(function(e) {
      e.preventDefault();
      $(".overlay").trigger("click");
      return false;
    });
    signIn.find("button").click(function(e) {
      e.preventDefault();
      $.ajax({
        url: "/secure/sign-in",
        method: "post",
        contentType: "application/json",
        data: JSON.stringify({
          email: signIn.find("#sign-in-email").val(),
          password: signIn.find("#sign-in-password").val()
        }),
        success: function(d, s, x) {
          if (d && d.success) {
            window.location.href = window.location.href;
            return;
          }

          $(".sign-in-modal").addClass("no-no");
          setTimeout(function() {
            $(".sign-in-modal").removeClass("no-no");
          }, 500);
          signIn.find("#sign-in-password").val("");
        }
      });
      return false;
    });
    signIn.find(".social a").click(function(e) {
      e.preventDefault();
      document.cookie =
        "oauth_redirect=" + window.location.href + "; expires=; path=/";
      window.location.href = $(this).attr("href");
    });
  };
  Auth.signUp = function() {
    var signUp = content.find("form.sign-up");
    signUp.find("button").click(function(e) {
      e.preventDefault();
      signUp.find(".mandatory").trigger("keyup");

      if (signUp.find(".error").length) {
        $(".sign-in-modal").addClass("no-no");
        setTimeout(function() {
          $(".sign-in-modal").removeClass("no-no");
        }, 500);
        signUp.find(".error:first input").focus();
        return false;
      }

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
        success: function(d, s, x) {
          if (d && d.success) {
            $.ajax({
              url: "/secure/sign-in",
              method: "post",
              contentType: "application/json",
              data: JSON.stringify({
                email: user.email,
                password: user.password
              }),
              success: function(d, s, x) {
                window.location.href = window.location.href;
              }
            });
            return;
          }

          $(".sign-in-modal").addClass("no-no");
          setTimeout(function() {
            $(".sign-in-modal").removeClass("no-no");
          }, 500);
        }
      });
      return false;
    });
  };
  Auth.forgotPassword = function() {
    var forgotPassword = content.find("form.password-reset-request");
    forgotPassword.find("button").click(function(e) {
      var button = $(this);
      e.preventDefault();
      forgotPassword.find(".mandatory").trigger("keyup");

      if (forgotPassword.find(".error").length) {
        $(".sign-in-modal").addClass("no-no");
        setTimeout(function() {
          $(".sign-in-modal").removeClass("no-no");
        }, 500);
        forgotPassword.find(".error:first input").focus();
        return false;
      }

      var user = {
        email: forgotPassword.find("#forgot-password-email").val()
      };

      button.attr("disabled", "disabled");
      $.ajax({
        url: "/secure/forgot-password-request?v=" + new Date().getTime(),
        method: "post",
        contentType: "application/json",
        data: JSON.stringify(user),
        success: function(d, s, x) {
          button.removeAttr("disabled");

          if (d && d.success) {
            forgotPassword
              .empty()
              .append('<p class="response-message">' + d.message + "</p>");
            return;
          }

          forgotPassword.find(".response-message").text(d.message);
          $(".sign-in-modal").addClass("no-no");
          setTimeout(function() {
            $(".sign-in-modal").removeClass("no-no");
          }, 500);
        }
      });
      return false;
    });
  };
  Auth.resetPassword = function() {
    var resetPassword = content.find("form.password-reset-verification");
    content.find("form.active").removeClass("active");
    content.find("nav.options").remove();
    resetPassword.addClass("active");
    resetPassword.find("button").click(function(e) {
      var button = $(this);
      e.preventDefault();
      resetPassword.find(".mandatory").trigger("keyup");

      if (resetPassword.find(".error").length) {
        $(".sign-in-modal").addClass("no-no");
        setTimeout(function() {
          $(".sign-in-modal").removeClass("no-no");
        }, 500);
        resetPassword.find(".error:first input").focus();
        return false;
      }

      var user = {
        email: resetPassword.find("#verify-reset-email").val(),
        token: resetPassword.data("token"),
        password: resetPassword.find("#verify-reset-password").val(),
        passwordConfirm: resetPassword
          .find("#verify-reset-confirm-password")
          .val()
      };

      button.attr("disabled", "disabled");
      $.ajax({
        url: "/secure/reset-password?v=" + new Date().getTime(),
        method: "post",
        contentType: "application/json",
        data: JSON.stringify(user),
        success: function(d, s, x) {
          button.removeAttr("disabled");

          if (d && d.success) {
            resetPassword
              .empty()
              .append('<p class="response-message">' + d.message + "</p>");

            setTimeout(function() {
              document.location.href = "/";
            }, 2000);
            return;
          }

          resetPassword.find(".response-message").text(d.message);
          $(".sign-in-modal").addClass("no-no");
          setTimeout(function() {
            $(".sign-in-modal").removeClass("no-no");
          }, 500);
        }
      });
      return false;
    });
  };
  Auth.validatePassword = function(value) {
    return (
      (value &&
        value.length >= 6 &&
        /(.*[A-Z]+.*[0-9]+.*)|(.*[0-9]+.*[A-Z]+.*)/.test(value) &&
        true) ||
      false
    );
  };
  Auth.validateConfirmPassword = function(value) {
    var signUp = content.find("form.sign-up");
    return value === signUp.find("#sign-up-password").val();
  };
  Auth.validateConfirmResetPassword = function(value) {
    var resetPassword = content.find("form.password-reset-verification");
    return value === resetPassword.find("#verify-reset-password").val();
  };
  Auth.openAuthModal = function(args) {
    var url = "/secure/sign-in";

    if (args && args.data) {
      var q = [];
      var keys = Object.keys(args.data);

      for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        q.push(key + "=" + args.data[key]);
      }

      url += "?" + q.join("&");
    }
    $.ajax({
      url: url,
      method: "get",
      success: function(d, s, x) {
        content = $(d);
        content.find(".close").remove();
        Auth.signIn();
        Auth.signUp();
        Auth.forgotPassword();
        Auth.nav();
        Shared.showOverlay({
          content: content,
          blockClose: args && args.blockClose
        });
        args && args.callback && args.callback();
      }
    });
  };
});
