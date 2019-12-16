$(document).ready(function() {
  (function followerEvents() {
    $("button.follow").click(function(e) {
      e.preventDefault();
      $.ajax({
        url:
          "/user/" +
          $(this).data("target") +
          "/follow?v=" +
          new Date().getTime(),
        method: "post",
        success: function(d) {
          window.location.reload();
        },
        error: function(e) {
          alert(e);
        }
      });
      return false;
    });
    $("button.unfollow").click(function(e) {
      e.preventDefault();
      $.ajax({
        url:
          "/user/" +
          $(this).data("target") +
          "/follow?v=" +
          new Date().getTime(),
        method: "delete",
        success: function(d) {
          window.location.reload();
        },
        error: function(e) {
          alert(e);
        }
      });
      return false;
    });
  })();
});
