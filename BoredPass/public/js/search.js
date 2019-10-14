BoredPass.Search = {};

$(document).ready(function() {
  var searchBox;

  BoredPass.Search.render = function(target) {
    target.click(function(e) {
      e.preventDefault();

      if (searchBox) return false;

      $.ajax({
        url: "/search/load",
        method: "get",
        success: function(d, s, x) {
          content = $(d);
          content
            .find("input")
            .focus(function() {
              $(this)
                .parent()
                .addClass("focus");
              content
                .find("input")
                .not($(this))
                .closest("form")
                .addClass("defocus");
            })
            .blur(function() {
              content
                .find("input")
                .closest("form")
                .removeClass("focus defocus");
            });
          content.find(".fa-times").click(function(e) {
            e.preventDefault();
            content.remove();
            searchBox = null;
            $("#header nav:first").removeClass("search-open");
            return false;
          });
          content
            .find(".list input")
            .focus(function() {
              $(this)
                .parent()
                .next("ul")
                .removeClass("hidden");
            })
            .blur(function() {
              var self = $(this);
              setTimeout(function() {
                self
                  .parent()
                  .next("ul")
                  .addClass("hidden");
              }, 100);
            })
            .keydown(function(e) {
              var list = $(this)
                .closest("form")
                .find("ul");
              var selectOption = function(direction) {
                if (!list.find(".option").length) return;

                var currentActive = list.find(".option.active").closest("li");
                currentActive.find("a").removeClass("active");

                if (!currentActive.length)
                  return list
                    .find(".option" + (direction === "up" ? ":last" : ":first"))
                    .addClass("active");

                if (direction === "up") {
                  if (currentActive.prev("li").find(".option").length)
                    return currentActive
                      .prev("li")
                      .find(".option")
                      .addClass("active");

                  return list.find(".option:last").addClass("active");
                }

                if (currentActive.next("li").find(".option").length)
                  return currentActive
                    .next("li")
                    .find(".option")
                    .addClass("active");

                return list.find(".option:first").addClass("active");
              };

              switch (e.which) {
                case 13: // enter
                  e.preventDefault();
                  list.find(".option.active").trigger("mousedown");
                  return false;
                case 38: // up
                  e.preventDefault();
                  selectOption("up");
                  return false;
                case 40: // down
                  e.preventDefault();
                  selectOption("down");
                  return false;
              }
            });
          $("#header nav:first").after(content);
          $("#header nav:first").addClass("search-open");
          content.find("input:first").focus();
          BoredPass.Search.location(content.find("#search-location"));
          BoredPass.Search.tags(content.find("#search-tags"));
          BoredPass.Search.distance(content.find("#search-distance"));
          BoredPass.Search.search(content.find("#submit-search"));
          searchBox = content;
        }
      });
      return false;
    });
  };
  BoredPass.Search.location = function(target) {
    target.closest("form").submit(function(e) {
      e.preventDefault();
      return false;
    });
    var list = target.closest("form").find("ul");
    var instructions = list.find("span").text();

    var performSearch = function() {
      $.ajax({
        url: "/search/location?search=" + encodeURIComponent(target.val()),
        method: "get",
        success: function(d, s, x) {
          list.empty();

          if (!d || !d.success || !d.data || !d.data.length)
            return list.append(
              "<li><span>No locations matching your search</span></li>"
            );

          d.data.map(function(location) {
            var parts = location.display_name.split(",");
            var shortName = parts[0];
            var country = parts.length > 1 ? parts[parts.length - 1] : null;
            var option = $(
              '<a href="/search/location/' +
                location.place_id +
                '" class="option" tabindex="-1">' +
                location.display_name +
                "</a>"
            );
            option.mousedown(function(e) {
              e.preventDefault();
              searchBox.find(".overview .location a").remove();
              var locationAnchor = $(
                '<a href="/search/location/' +
                  location.place_id +
                  '/remove">' +
                  shortName +
                  '<i class="fa fa-times" /></a>'
              );
              locationAnchor.data("place", location);
              locationAnchor.data("country", country);
              locationAnchor.click(function(e) {
                e.preventDefault();
                searchBox.find(".overview .location a").remove();
                searchBox
                  .find(".overview .location")
                  .append("<p>From here</p>");
                return false;
              });
              searchBox.find(".overview .location p").remove();
              searchBox.find(".overview .location").append(locationAnchor);
              target.trigger("blur");
              return false;
            });
            option.click(function(e) {
              e.preventDefault();
              return false;
            });
            var li = $("<li />");
            li.append(option);
            list.append(li);
          });
        }
      });
    };

    target.keyup(function(e) {
      switch (e.which) {
        case 38: // up
        case 40: // down
          e.preventDefault();
          return false;
      }

      if (!target.val()) {
        list.empty();
        list.append("<li><span>" + instructions + "</span></li>");
        return;
      }

      list.find(".active").removeClass("active");

      if (e.which === 13) performSearch();
    });
    target
      .closest("form")
      .find("button:first")
      .click(function(e) {
        e.preventDefault();
        target.focus();
        performSearch();
        return false;
      });
  };
  BoredPass.Search.tags = function(target) {
    var showTabLibrary = function() {
      $.ajax({
        url: "/libraries/tags/list",
        method: "get",
        success: function(d, s, x) {
          var content = $(d);
          var tagContainer = content.find(".tag-container");
          content.find(".close").click(function(e) {
            e.preventDefault();
            Shared.hideOverlay(null, content.closest(".overlay"));
            return false;
          });
          content.find(".tags > a").each(function() {
            var tagOption = $(this);
            var tag = tagOption.data("value");

            var tagElement = function() {
              var a = $(
                '<a id="' +
                  tag._id +
                  '" href="/remove-tag"><label>' +
                  tag.name +
                  "</label><span>+</span></a>"
              );
              a.click(function(e) {
                e.preventDefault();
                removeTag(tag);
                tagOption.removeClass("selected");
                $(this).remove();
                return false;
              });
              tagContainer.append(a);
            };

            if (
              selectedTags.find(function(t) {
                return t._id === tag._id;
              })
            ) {
              tagOption.addClass("selected");
              tagElement();
            }

            tagOption.click(function(e) {
              e.preventDefault();
              var tag = tagOption.data("value");
              if (tagOption.hasClass("selected")) {
                removeTag(tag);
                tagContainer.find("#" + tag._id).remove();
                tagOption.removeClass("selected");
              } else {
                selectTag(tag);
                selectedTags.push(tag);
                tagElement();
                tagOption.addClass("selected");
              }
              return false;
            });
          });
          Shared.showOverlay({
            content: content
          });
        }
      });
    };

    var removeTag = function(tag) {
      searchBox.find(".overview .tags a." + tag.icon).remove();

      if (!searchBox.find(".overview .tags a").length)
        searchBox.find(".overview .tags").html("<p>Any activity type</p>");

      resetSelectedTags();
    };

    var selectTag = function(tag, option) {
      var tagAnchor = $(
        '<a href="/search/tag/' +
          tag.icon +
          '/remove" class="' +
          tag.icon +
          '" id="' +
          tag._id +
          '">' +
          tag.name +
          '<i class="fa fa-times" /></a>'
      );
      tagAnchor.data("tag", tag);
      tagAnchor.click(function(e) {
        e.preventDefault();
        tagAnchor.remove();
        option && option.find(".fa.fa-check").remove();
        removeTag(tag);
        return false;
      });
      searchBox.find(".overview .tags p").remove();
      searchBox.find(".overview .tags").append(tagAnchor);
      resetSelectedTags();
    };

    var resetSelectedTags = function() {
      selectedTags = [];
      searchBox.find(".overview .tags a").each(function() {
        selectedTags.push($(this).data("tag"));
      });
    };

    target.closest("form").submit(function(e) {
      e.preventDefault();
      return false;
    });

    target
      .closest("form")
      .find("button:first")
      .click(function(e) {
        e.preventDefault();
        target.val("");
        list.empty();
        resetSelectedTags();
        showTabLibrary();
        return false;
      });

    var list = target.closest("form").find("ul");
    var instructions = list.find("span").text();
    var selectedTags = [];

    target
      .keyup(function(e) {
        switch (e.which) {
          case 13: // enter
          case 38: // up
          case 40: // down
            e.preventDefault();
            return false;
        }

        if (!target.val()) {
          list.empty();
          list.append("<li><span>" + instructions + "</span></li>");
          return;
        }

        $.ajax({
          url:
            "/libraries/tags/search?search=" + encodeURIComponent(target.val()),
          method: "get",
          success: function(d, s, x) {
            list.empty();

            if (!d || !d.length)
              return list.append(
                "<li><span>No tags matching your search</span></li>"
              );

            d.map(function(tag) {
              var option = $(
                '<a href="/search/tag/' +
                  tag.icon +
                  '" class="option" tabindex="-1">' +
                  tag.name +
                  "</a>"
              );
              selectedTags.map(function(t) {
                if (tag._id === t._id)
                  option.append('<i class="fa fa-check" />');
              });
              option.mousedown(function(e) {
                e.preventDefault();
                list.find(".active").removeClass("active");
                option.addClass("active");

                if (option.find(".fa.fa-check").length) {
                  option.find(".fa.fa-check").remove();
                  removeTag(tag);
                  return;
                }

                option.append('<i class="fa fa-check" />');
                selectTag(tag, option);
                return false;
              });
              option.click(function(e) {
                e.preventDefault();
                return false;
              });
              var li = $("<li />");
              li.append(option);
              list.append(li);
            });
          }
        });
      })
      .focus(function(e) {
        target
          .next("ul")
          .find(".active")
          .removeClass("active");
      });
  };
  BoredPass.Search.distance = function(target) {
    var options = target.closest("form").find("ul .option");

    options
      .mousedown(function(e) {
        e.preventDefault();
        var option = $(this);
        var isSelected = (option.find(".fa.fa-check").length && true) || false;
        options.find(".fa.fa-check").remove();
        searchBox.find(".overview .distance a, .overview .distance p").remove();
        target
          .closest("form")
          .find("ul .active")
          .removeClass("active");
        option.addClass("active");

        if (option.text().indexOf("Any distance") >= 0 || isSelected)
          return searchBox
            .find(".overview .distance")
            .append("<p>Any distance</p>");

        option.append('<i class="fa fa-check" />');
        var distanceAnchor = $(
          '<a href="/search/distance/' +
            option.data("distance") +
            '/remove">' +
            option.text() +
            '<i class="fa fa-times" /></a>'
        );
        distanceAnchor.data("distance", option.data("distance"));
        distanceAnchor.click(function(e) {
          e.preventDefault();
          distanceAnchor.remove();
          option.find(".fa.fa-check").remove();

          if (!searchBox.find(".overview .distance a").length)
            searchBox.find(".overview .distance").append("<p>Any distance</p>");

          return false;
        });
        searchBox.find(".overview .distance p").remove();
        searchBox.find(".overview .distance").append(distanceAnchor);
        target.trigger("blur");
        return false;
      })
      .click(function(e) {
        e.preventDefault();
        return false;
      });
    target.keyup(function(e) {
      e.preventDefault();
      return false;
    });
  };
  BoredPass.Search.search = function(target) {
    target.click(function() {
      var redirect = function() {
        var url = "/search/1";
        url += "?tags=" + tags.join(",");
        url += "&distance=" + distance.join(",");
        url += "&lat=" + lat.join(",");
        url += "&lon=" + lon.join(",");

        if (location) url += "&place=" + encodeURIComponent(location);

        window.location.href = url;
      };
      var tags = [],
        lat = [],
        lon = [],
        distance = [],
        location;
      searchBox.find(".overview .tags a").each(function() {
        tags.push($(this).data("tag")._id);
      });
      searchBox.find(".overview .distance a").each(function() {
        distance.push($(this).data("distance"));
      });
      searchBox.find(".overview .location a").each(function() {
        var place = $(this).data("place");
        lat.push(place.lat);
        lon.push(place.lon);
        location = $(this).text();

        if ($(this).data("country")) location += ", " + $(this).data("country");
      });

      if (!lat.length || !lon.length)
        return Shared.location({
          callback: function(pos) {
            if (!pos) return redirect();

            lat.push(pos.coords.latitude);
            lon.push(pos.coords.longitude);
            redirect();
          }
        });

      redirect();
    });
  };

  BoredPass.Search.render($("#header nav .find"));
});
