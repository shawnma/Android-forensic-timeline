

// name selects the div for bearing svg
function SOMGraph(name, nodes, app_traces) {
    /*Disable global name $ from jQuery and reload it into Zepto*/
    jQuery.noConflict();
    $ = Zepto;
    var self = this;

    console.log(app_traces);

    //OpenTip config
    Opentip.styles.tooltip_style = {
        stem: true,
        hideDelay: 0.2,
        delay: 0.3,
        tipJoint: "bottom right",
        target: true,
        borderWidth: 0
    };

    // class variable
    this.name = name;
    this.nodes = nodes;
    this.dataset = app_traces;

    // dimensions
    var width = 1800;
    var height = 820;

    // threshold of temporal distance [default to 5]
    var dist_threshold = 5;

    var som_width = 5; //FIXME read from config file
    var som_height = 3; //FIXME read from config file
    var extent = 20;

    // define SOM axes domain
    var x_domain = [];
    for (var i = 0; i < som_width; ++i) {
        x_domain.push(i * extent);
    }
    var y_domain = [];
    for (var i = 0; i < som_height; ++i) {
        y_domain.push(i * extent);
    }

    // init X axis scale
    var x_scale = d3.scale.ordinal()
        .domain(x_domain)
        .rangePoints([150, width], 1.5);
        //.range([x_padding * 3, width - x_padding]);

    // init Y axis scale
    var y_scale = d3.scale.ordinal()
        .domain(y_domain)
        .rangePoints([height, 0], 1.5);
        //.range([height - y_padding * 3, y_padding]);

    // color scale for different apps
    var color_scale = d3.scale.category20();

    // define radius function
    var radius = function(d) { return d.count; }

    // define X axis function
    var x = function(d) { return d.x * extent; }

    // define Y axis function
    var y = function(d) { return d.y * extent; }

    var max_count = 0;
    for (var index in nodes) {
        if (index === undefined) continue;
        if (nodes[index].count > max_count) max_count = nodes[index].count;
    }
    // define radius range
    var radius_range = [5, Math.round(height / som_width)];
    var radius_scale = d3.scale.sqrt()
        .domain([1, max_count])
        .range(radius_range)
        .clamp(true);

    // create svg for aggregated graph
    var som_graph = d3.select(this.name)
        .append("svg")
        .attr("class", "som-graph")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0, 20)");

    /* draw grid lines on the graph */
    // vertical lines
    var grid_y = som_graph.selectAll("line.grid-line-y")
        .data(x_domain)
        .enter()
        .append("g")
        .attr("class", "grid-som-y");
    grid_y.append("line")
        .attr("class", "grid-line-y")
        .attr("y1", 0)
        .attr("y2", height)
        .attr("x1", x_scale)
        .attr("x2", x_scale);
    // horizontal lines
    var grid_x = som_graph.selectAll("line.grid-line-x")
        .data(y_domain)
        .enter()
        .append("g")
        .attr("class", "grid-som-x");
    grid_x.append("line")
        .attr("class", "grid-line-x")
        .attr("y1", y_scale)
        .attr("y2", y_scale)
        .attr("x1", 0)
        .attr("x2", width);

    // draw clusters on graph
    var som_nodes = som_graph.append("g")
        .attr("id", "som-nodes")
        .selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("id", function(d, index) { return "node-" + index })
        .style("fill", 'gray')
        .style("opacity", "0.1")
        .style('stroke', 'black')
        .attr("cx", function(d) { return x_scale(x(d)); })
        .attr("cy", function(d) { return y_scale(y(d)); })
        .attr("r", function(d) { return radius_scale(radius(d)); })
        .sort(function(x, y) {return radius(y) - radius(x)});

    // draw apps in each node on graph
    var offset_range = _.range(-radius_range[1] + extent, radius_range[1] - extent, 8);
    for (var index in nodes) {
        offset_range = _.shuffle(offset_range); // shuffle the offset range every time
        som_graph.append("g")
            .selectAll(".node-app-" + index)
            .data(nodes[index].extra_data.apps)
            .enter().append("circle")
            .attr("class", "node-app-" + index)
            .style("fill", function(d) {
                return color_scale(d);
            })
            .attr("cx", function(d, i) {
                return x_scale(nodes[index].x * extent) + offset_range[i];
            })
            .attr("cy", function(d, i) {
                var y_offset = (i * i) % offset_range.length;
                return y_scale(nodes[index].y * extent) + offset_range[y_offset];
            })
            .attr("r", 5);
    }

    // append legend to the graph (too many to show properly)
    var legend = som_graph.selectAll(".legend")
        .data(color_scale.domain().slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 14 + ")"; });

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 8)
        .attr("height", 8)
        .style("fill", color_scale);

    legend.append("text")
        .attr("x", 10)
        .attr("y", 5)
        .attr("dy", ".25em")
        .style("text-anchor", "start")
        .text(function(d) {
            return d.substr(4); // remove `com.` to save space
        });

    // graph title, explaination of the graph
    som_graph.append("text")
        .attr("class", "stack-graph-title")
        .attr("x", (width / 2))
        .attr("y", 0)
        .text("Self-Organizing Map of Device Activities");

    // cluster path generator
    this.cluster_path = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate("basis");

    // cluster path color generator
    this.path_color_scale = d3.scale.category20();

    // cluster features description generator
    var formatMessage = function(features) {
        var message = "";
        message += "Duration: " + features[0] + "[seconds]";
        message += "</br>";
        message += "Events #: " + features[1];
        message += "</br>";
        message += "System Calls #: " + features[2];
        message += "</br>";
        message += "Database Opr #: " + features[4];
        message += "</br>";
        message += "ContentProvider Opr #: " + features[5];
        message += "</br>";
        message += "Network Opr #: " + features[6];
        message += "</br>";
        return message;
    }

    // generate time reference for each cluster
    for (var index in nodes) {
        if (index === undefined) continue;
        nodes[index].extra_data.time_ref = [];
        nodes[index].extra_data.time_ref.push(d3.min(nodes[index].extra_data.start_date)); // min date
        nodes[index].extra_data.time_ref.push(d3.median(nodes[index].extra_data.start_date)); // median date
        nodes[index].extra_data.time_ref.push(d3.max(nodes[index].extra_data.start_date)); // max date
    }

    // draw path for cluster apps and cluster time relations
    for (var index in nodes) {
        if (index === undefined) continue;
        var cluster = $('#node-' + index);
        var center = {x: Number(cluster.attr('cx')), y: Number(cluster.attr('cy'))};
        var cluster_apps = $('.node-app-' + index);
        cluster_apps.forEach(function(app) {
            var site = {
                x: Number($(app).attr('cx')),
                y: Number($(app).attr('cy'))
            };
            var path_data = [center, site];
            som_graph.append('svg:path')
                .attr("d", self.cluster_path(path_data))
                .attr("stroke", self.path_color_scale(index)) // index of map nodes
                .attr("stroke-width", 0.8)
                .attr("fill", "none");
        }, this); // specify the scope in callback
        // set opentip content for map node
        jQuery("#node-" + index).opentip(formatMessage(nodes[index].features), {style: "tooltip_style"});
        // add mouse event animation
        cluster.mouseover(function(event) {
            var event_self = this;
            this.setAttribute("cursor", "pointer");
        })
        .mouseout(function(event) {
            this.setAttribute("cursor", null);
        });

        // calculate time distance of clusters
        var dist_list = [];
        for (var _index in nodes) {
            if (_index === undefined || _index === index) continue;
            var dist = euclidean_distance(nodes[index].extra_data.time_ref, nodes[_index].extra_data.time_ref);
            dist_list[_index] = dist;
        }

        // connect temporally close clusters
        for (var _index in dist_list) {
            if (_index === undefined) continue;
            if (dist_list[_index] <= dist_threshold) {
                var close_cluster = $('#node-' + _index);
                var close_site = {x: Number(close_cluster.attr('cx')), y: Number(close_cluster.attr('cy'))};
                var random_offset = _.random(-20, 20);
                var assist_site = {x: (center.x + close_site.x) / 2, y: (center.y + close_site.y) / 2 + random_offset};
                var time_path = [center, assist_site, close_site];
                som_graph.append('svg:path')
                    .attr("id", "temporal-conn")
                    .attr("d", this.cluster_path(time_path))
                    .attr("stroke", this.path_color_scale(index))
                    .attr("stroke-width", 0.8)
                    .attr("stroke-dasharray", "10,10,5")
                    .attr("fill", "none");
            }
        }
    } // for loop over map nodes
}

SOMGraph.prototype.appendApps = function(app_list) {
    console.log(app_list);
}

SOMGraph.prototype.onThresholdChange = function(threshold) {
    // clear old temporal connections
    d3.selectAll("#temporal-conn").remove();
    // calculate new temporal connections
    for (var index in this.nodes) {
        if (index === undefined) continue;
        var cluster = $('#node-' + index);
        var center = {x: Number(cluster.attr('cx')), y: Number(cluster.attr('cy'))};

        // calculate time distance of clusters
        var dist_list = [];
        for (var _index in this.nodes) {
            if (_index === undefined || _index === index) continue;
            var dist = euclidean_distance(this.nodes[index].extra_data.time_ref, this.nodes[_index].extra_data.time_ref);
            dist_list[_index] = dist;
        }

        // connect temporally close clusters
        for (var _index in dist_list) {
            if (_index === undefined) continue;
            if (dist_list[_index] <= threshold) {
                var close_cluster = $('#node-' + _index);
                var close_site = {x: Number(close_cluster.attr('cx')), y: Number(close_cluster.attr('cy'))};
                var random_offset = _.random(-20, 20);
                var assist_site = {x: (center.x + close_site.x) / 2, y: (center.y + close_site.y) / 2 + random_offset};
                var time_path = [center, assist_site, close_site];
                d3.select('.som-graph g').append('svg:path')
                    .attr("id", "temporal-conn")
                    .attr("d", this.cluster_path(time_path))
                    .attr("stroke", this.path_color_scale(index))
                    .attr("stroke-width", 0.8)
                    .attr("stroke-dasharray", "10,10,5")
                    .attr("fill", "none");
            }
        }
    }
}

// calculate euclidean distance of two time references
function euclidean_distance(x, y) {
    var sum = 0.0;
    for (var index in x) {
        sum += Math.pow(x[0] - y[0], 2);
    }
    return Math.sqrt(sum, 2);
}





