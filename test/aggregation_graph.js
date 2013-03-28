
// name indicates the div for bearing svg
function AggregatedGraph(name, dataset) {
    /*Disable global name $ from jQuery and reload it into Zepto*/
    jQuery.noConflict();
    $ = Zepto;

    //OpenTip config
    Opentip.styles.tooltip_style = {
        stem: true,
        hideDelay: 0.2,
        delay: 0.3,
        tipJoint: "top",
        target: true,
        borderWidth: 0
    };

    // class variable
    this.name = name;
    this.object = dataset.object;
    this.aggregation_type = dataset.type;
    this.dataset = this.initDataset(dataset);
    this.x_domain_min;
    this.x_domain_max;
    this.y_domain_min;
    this.y_domain_max;
    this.initXDomain();
    this.initYDomain();
    var self = this;

    // visualisation functions
    this.radius = function(d) { return d.messages.length; }
    this.x = function(d) { return d.timestamp; }
    this.y = function(d) { return d.object_id; }
    this.color = function(d) { return d.object_id; }

    // dimensions
    this.width = "100%";
    this.height = 620; // unit: px
    this.x_range = [100, 1400];
    this.y_range = [this.height - 100, 100];

    // init a broader bounds for the selected time window
    var start_date = new Date((this.dataset[0].timestamp - 30) * 1000);
    var end_date = new Date((this.dataset[this.dataset.length - 1].timestamp + 30) * 1000);

    // convert epoch timestamp to date for d3 time scale
    this.dataset.forEach(function(record) {
        var date = new Date(record.timestamp * 1000); // convert to milliseconds
        record.timestamp = date;
    });

    // graph scales
    this.x_scale = d3.time.scale.utc().domain([start_date, end_date]).range(this.x_range);
    this.y_scale = d3.scale.linear().domain(
        [this.y_domain_min, this.y_domain_max]
    ).range(this.y_range);
    this.radius_scale = d3.scale.linear()
        .domain([1, this.maxMessageNumber()])
        .range([10,30]);
    this.color_scale = d3.scale.category10();

    // axes
    this.x_axis = d3.svg.axis()
        .orient("top")
        .scale(this.x_scale)
        .ticks(d3.time.seconds.utc, 15);

    this.x_axis.tickFormat(function(date) {
        formatter = d3.time.format.utc("%Y%m%d %H:%M:%S");
        return formatter(date);
    });

    // create svg for aggregated graph
    this.aggregated_graph = d3.select(this.name)
        .append("svg")
        .attr("class", "aggregated-graph")
        .attr("width", this.width)
        .attr("height", this.height);

    this.clusters = this.aggregated_graph.append("g")
        .attr("id", "clusters")
        .selectAll(".cluster")
        .data(this.dataset)
        .enter().append("circle")
        .attr("class", "cluster")
        .style("fill", function(d) { return self.color_scale(self.color(d)); })
        .attr("cx", function(d) { return self.x_scale(self.x(d)); })
        .attr("cy", function(d) { return self.y_scale(self.y(d)); })
        .attr("r", function(d) { return self.radius_scale(self.radius(d)); })
        .sort(function(x, y) {return self.radius(y) - self.radius(x)});

    this.aggregated_graph.append('g')
        .attr("class", "aggregation-axis")
        .attr("transform", "translate(0, " + (this.height - 50) + ")")
        .call(this.x_axis);

    var rules = this.aggregated_graph.selectAll("line.rule")
        .data(this.x_scale.ticks(d3.time.seconds.utc, 15))
        .enter()
        .append("g")
        .attr("class", "rule");

    rules.append("line")
        .attr("y1", 0)
        .attr("y2", this.height - 50)
        .attr("x1", this.x_scale)
        .attr("x2", this.x_scale);

} // class construction function

AggregatedGraph.prototype.maxMessageNumber = function() {
    var max = 0;
    this.dataset.forEach(function(data) {
        if (data.messages.length >= max) {
            max = data.messages.length;
        }
    });
    return max;
}

AggregatedGraph.prototype.initDataset = function(dataset) {
    dataset_buf = [];
    dataset.content.forEach(function(data) {
        if (dataset.type === 'pid') {
            if (data.value.is_single != null) {
                var ts = data.value.date;
                var msg = data.value.msg;
                data.value = {};
                data.value[ts] = [msg];
            }
            for (timestamp in data.value) {
                data_buf = {};
                data_buf.object_id = Number(data._id);
                data_buf.timestamp = Number(timestamp);
                data_buf.messages = data.value[timestamp];
                dataset_buf.push(data_buf);
            }
        } else { // type is date
            if (data.value.is_single != null) {
                var id = data.value.id;
                var msg = data.value.msg;
                data.value = {};
                data.value[id] = [msg];
            }
            for (id in data.value) {
                data_buf = {};
                data_buf.object_id = Number(id);
                data_buf.timestamp = Number(data._id);
                data_buf.messages = data.value[id];
                dataset_buf.push(data_buf);
            }
        }
    });

    return dataset_buf;
}

AggregatedGraph.prototype.initXDomain = function() {
    var x_max = this.dataset[0].timestamp, x_min = this.dataset[0].timestamp;
    this.dataset.forEach(function(data) {
        if (data.timestamp >= x_max) {
            x_max = data.timestamp;
        } else if (data.timestamp <= x_min) {
            x_min = data.timestamp;
        }
    });
    this.x_domain_min = x_min;
    this.x_domain_max = x_max;
}

AggregatedGraph.prototype.initYDomain = function() {
    var y_max = this.dataset[0].object_id, y_min = this.dataset[0].object_id;
    this.dataset.forEach(function(data) {
        if (data.object_id >= y_max) {
            y_max = data.object_id;
        } else if (data.object_id <= y_min) {
            y_min = data.object_id;
        }
    });
    this.y_domain_min = y_min;
    this.y_domain_max = y_max;
}















