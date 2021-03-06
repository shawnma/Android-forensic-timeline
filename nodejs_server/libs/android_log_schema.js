
exports.EVENT_SCHEMA = {
    date: Number,
    msg: String,
    object: String,
    pid: String,
    level: String
};

exports.collections = ['radio', 'events', 'main', 'system'];

exports.name = "android_logs";

exports.fields = ["date", "pid", "object", "msg", "level"];

var dateReduceFunction = function(key, values) {
    var content = {dates: [], msgs: [], count: 0};
    values.forEach(function(value) {
        content.dates = value.dates.concat(content.dates);
        content.msgs = value.msgs.concat(content.msgs);
        content.count += value.count;
    });
    return content;
}

// aggregation by date, but result turns out the same with by object
/*
var aggregateByDate = {};
aggregateByDate.map = function() {
    var key = this.date;
    var value = {
        id: this.pid,
        msg: this.msg,
        is_single: 1
    };
    emit(key, value);
}
aggregateByDate.reduce = function(key, values) {
    var content = {};
    values.forEach(function(value) {
        if (content[value.id] == null) {
            content[value.id] = [];
        }
        content[value.id].push(value.msg);
    });
    return content;
}
aggregateByDate.out = {'replace':'LogsMapReduceResults'};
exports.aggregateByDate = aggregateByDate;
*/

var aggregateByObject = {};
aggregateByObject.map = function() {
    var key = this.pid;
    var value = {
        dates: [this.date],
        msgs: [this.msg],
        count: 1
    };
    emit(key, value);
}
aggregateByObject.reduce = dateReduceFunction;
exports.aggregateByObject = aggregateByObject;

var aggregateByPid = {};
aggregateByPid.map = function() {
    var key = this.object;
    var value = {
        dates: [this.date],
        msgs: [this.msg],
        count: 1
    };
    emit(key, value);
}
aggregateByPid.reduce = dateReduceFunction;
exports.aggregateByPid = aggregateByPid;













