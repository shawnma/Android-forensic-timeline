
//FIXME Reset sometimes move the timelines to non-original place...

// skip the height of nav buttons
var timeline_class = $(".timeline");
var margin_top = timeline_class.css('margin-top');
margin_top = parseInt(margin_top.substr(0, margin_top.length - 2));
var offset_0 = margin_top;
var offset_1 = offset_0;
var timeline_0 = this.timeline_0;
var timeline_1 = this.timeline_1;


var zoom = function(target, scale) {
    var cur_height = target.getHeight();
    var cur_svg = $(target.getName()).children();
    cur_svg.remove(); // remove the old svg
    target.updateHeight(cur_height + scale);
    target.onDataReady();
};

// button down
btn = $('#ctl_panel_0').children()[0];
btn.onclick = function(){
    offset_0 += 5;
    $('#timeline_0').css("margin-top", offset_0 + "px");
};

// button up
btn = $('#ctl_panel_0').children()[1];
btn.onclick = function(){
    offset_0 -= 5;
    $('#timeline_0').css("margin-top", offset_0 + "px");
};

// button reset
btn = $('#ctl_panel_0').children()[2];
btn.onclick = function(){
    offset_0 = parseInt(margin_top);
    $('#timeline_0').css("margin-top", offset_0 + "px");
};

// button in
btn = $('#ctl_panel_0').children()[3];
btn.onclick = function() {
    zoom(timeline_0, 3000);
}

// button out
btn = $('#ctl_panel_0').children()[4];
btn.onclick = function(){
    zoom(timeline_0, -3000);
};

// button down
btn = $('#ctl_panel_1').children()[0];
btn.onclick = function(){
    offset_1 += 5;
    $('#timeline_1').css("margin-top", offset_1 + "px");
};

// button up
btn = $('#ctl_panel_1').children()[1];
btn.onclick = function(){
    offset_1 -= 5;
    $('#timeline_1').css("margin-top", offset_1 + "px");
};

// button reset
btn = $('#ctl_panel_1').children()[2];
btn.onclick = function(){
    offset_1 = parseInt(margin_top);
    $('#timeline_1').css("margin-top", offset_0 + "px");
};

// button in
btn = $('#ctl_panel_1').children()[3];
btn.onclick = function(){
    zoom(timeline_1, 3000);
};

// button out
btn = $('#ctl_panel_1').children()[4];
btn.onclick = function(){
    zoom(timeline_1, -3000);
};

window.onscroll = function(event) {
    if (window.scrollY >= window.innerHeight) {
        $('.back-to-top').css('opacity', 0.8).css('z-index', 100);
    } else {
        $('.back-to-top').css('opacity', 0).css('z-index', -1);
    }
}

// button of POC
btn = $('#test');
btn.click(function() {
    var query_2 = [
        {
            uri: "/fs_time",
            collection: "fs_time",
            selection: JSON.stringify({
                date: {
                    $gte: 1362129603,
                    $lte: 1362132603
                }
            }),
            fields: null,
            options: null
        }
    ];

    timeline_1.initTimeline();
    timeline_1.fetchData(query_2);

/*  adding new events on the same timeline
    var cur_svg = $(timeline_0.getName()).children();
    cur_svg.remove();
    timeline_0.initTimeline();
    timeline_0.fetchData(query_2);
*/
});





