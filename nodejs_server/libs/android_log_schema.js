
exports.EVENT_SCHEMA = {
    date: Number,
    msg: String,
    object: String,
    pid: String,
    level: String
};

exports.collections = ['dmesg', 'radio', 'events', 'main', 'system'];

exports.name = "android_log_schema";

exports.fields = ["date", "pid", "object", "msg", "level"];

exports.hello = function(msg) {
    console.log(msg);
}

var aggregateByDate = {};
aggregateByDate.map = function() {
    var key = this.date;
    var value = {
        pid: this.pid,
        msg: this.msg
    };
    emit(key, value);
}
aggregateByDate.reduce = function(key, values) {
    var content = {};
    values.forEach(function(value) {
        if (content[value.pid] == null) {
            content[value.pid] = [];
        }
        content[value.pid].push(value.msg);
    });
    return content;
}
aggregateByDate.out = {'replace':'LogsMapReduceResults'};
exports.aggregateByDate = aggregateByDate;

var aggregateByPid = {};
aggregateByPid.map = function() {
    var key = this.pid;
    var value = {
        date: this.date,
        msg: this.msg
    };
    emit(key, value);
}
aggregateByPid.reduce = function(key, values) {
    var content = {};
    values.forEach(function(value) {
        if (content[value.date] == null) {
            content[value.date] = [];
        }
        content[value.date].push(value.msg);
    });
    return content;
}
aggregateByPid.out = {'replace':'LogsMapReduceResults'};
exports.aggregateByPid = aggregateByPid;



