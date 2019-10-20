$(document).ready(function() {
  if ($(".status-message").data("resetresult"))
    setTimeout(function() {
      Auth.openAuthModal({
        data: $(".status-message").data("resetresult").data,
        blockClose: true,
        callback: Auth.resetPassword
      });
    }, 0); //2500);
});
