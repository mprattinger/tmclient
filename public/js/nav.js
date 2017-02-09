var mini_class = "sb-mini";
var mini_content_class = "sb-mini-content";

$(document).ready(function () {
    $(window).resize(function () {
        if (!isMobile()) {
            //Big Screen
            $(".sidebar").show();
            $(".userinfo").show();
        } else {
            $(".sidebar").hide();
            $(".userinfo").hide();
            deactivateMiniBar();
        }
    });

    $("a.mainhamburger").click(function () {
        if (!isMobile()) {
            if (miniBarActive()) {
                deactivateMiniBar();
            } else {
                activateMiniBar();
            }
        } else {
            //Bei Mobile noch die Sidebar zeigen
            $(".sidebar").slideToggle("fast");
        }
    });

    $(".has-sub-menu").each(function (i, ele) {
        $(ele).click(function (e) {
            //Dasselbe nochmal gedrückt?
            if ($(ele).next().hasClass("submenu-show")) {
                $(ele).next().removeClass("submenu-show");
            } else {
                //Alle offenen Submenu schließen
                $(".submenu").each(function (j, ele2) {
                    $(ele2).removeClass("submenu-show");
                });
                $(ele).next().addClass("submenu-show");
            }
        });
    });

    activateMiniBar();
});

function isMobile() {
    var sidebar_w = $(".sidebar").css("width");
    var content_left_m = $(".content").css("margin-left");
    if (sidebar_w == content_left_m) {
        //Big Screen
        return false;
    } else {
        return true;
    }
}

function miniBarActive() {
    var mini_div = $("." + mini_class);
    if (mini_div.length != 0)
        return true;
    else return false;
}

function activateMiniBar() {
    //css-Klassen anfügen
    var mini_div = $("div.sidebar");
    mini_div.addClass(mini_class);
    var mini_div = $("div.content");
    mini_div.addClass(mini_content_class);
}
function deactivateMiniBar() {
    //css-Klassen entfernen
    var mini_div = $("." + mini_class);
    var mini_contend_div = $("." + mini_content_class);
    mini_div.removeClass(mini_class)
    mini_contend_div.removeClass(mini_content_class);
}