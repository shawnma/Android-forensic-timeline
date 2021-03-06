/*
 *
 * Forensic timeline analysis
 *
 */

var db_name = process.argv[2];
var express = require('express');
var stylus = require('stylus');
var nib = require('nib');
var path = require('path');
var index_handler = require('./routes');
var db_handler = require('./routes/database');
var mongoose = require('mongoose');
var android_logs = require('./libs/android_log_schema.js');
var fs_time = require("./libs/fs_time_schema.js");
var inode_time = require("./libs/inode_time_schema.js");
var cp_applications = require("./libs/content_provider_applications.js");
var cp_browserhistory = require("./libs/content_provider_browserhistory.js");
var cp_browsersearches = require("./libs/content_provider_browsersearches.js");
var cp_calllogs = require("./libs/content_provider_calllogs.js");
var cp_contacts = require("./libs/content_provider_contacts.js");
var cp_mms = require("./libs/content_provider_mms.js");
var cp_sms = require("./libs/content_provider_sms.js");
var cp_services = require("./libs/content_provider_services.js");
var dmesg = require("./libs/dmesg_schema.js");
var temporal_info = require("./libs/temporal_info_schema.js");
var package_info = require("./libs/package_info_schema.js");

/*
 *  Init MongoDB connection and models
 */
mongoose.connect('mongodb://localhost/' + db_name);
mongoose.set("debug", true);

// init models for android logs
var schemas = [
    android_logs,
    cp_browsersearches,
    cp_browserhistory,
    cp_applications,
    cp_calllogs,
    cp_contacts,
    cp_mms,
    cp_sms,
    cp_services,
    fs_time,
    inode_time,
    temporal_info,
    package_info,
    dmesg
];

schemas.forEach(function(schema){
    schema.collections.forEach(function(collection) {
        mongoose.model(
            collection,
            mongoose.Schema(schema.LOG_SCHEMA),
            collection);
    });
});

// obtain express instance
var app = express();

// using stylus for CSS generation
function compile(str, path) {
    return stylus(str).set('filename', path).set('compress', true).use(nib());
};

// express server config
app.configure(function(){
    app.set('port', process.env.PORT || 2222);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(require('stylus').middleware(
            {
                src: path.join(__dirname, 'public'),
                compile: compile
            }
        )
    );
    app.use(express.static(path.join(__dirname, 'public')));
    app.locals.globalScripts = [
        // vendors
        '/js/vendor/jquery-1.9.1.min.js',
        '/js/vendor/d3.js',
        '/js/vendor/zepto.min.js',
        '/js/vendor/bootstrap.min.js',
        '/js/vendor/opentip-jquery.min.js',
        '/js/vendor/underscore-min.js',
        // own js
        '/js/timeline.js',
        '/js/aggregation_graph.js',
        '/js/som_graph.js',
        '/js/generic_data.js',
        '/js/tokenizer.js',
        '/js/delta_time_graph.js',
        '/js/signature_checker.js',
        '/js/vectorizer.js',
        '/js/som_config.js',
        // data models
        '/js/data_models/android_logs.js',
        '/js/data_models/browsersearches.js',
        '/js/data_models/browserhistory.js',
        '/js/data_models/applications.js',
        '/js/data_models/calllogs.js',
        '/js/data_models/contacts.js',
        '/js/data_models/fs_time.js',
        '/js/data_models/mms.js',
        '/js/data_models/services.js',
        '/js/data_models/sms.js',
        '/js/data_models/inode_time.js',
        '/js/data_models/dmesg.js',
        '/js/data_models/application_trace.js'
    ]
});

// routes of the web server (some are deprecated)
app.get('/', index_handler.imcom);
app.post('/som', db_handler.som);
app.post('/coords', db_handler.coords);
//app.post('/matrix', db_handler.matrix);
app.post('/token_index', db_handler.token_index);
app.post('/upload_log', db_handler.upload_log);
app.post('/mapreduce', db_handler.mapreduce);
app.post('/radio_activity', db_handler.radio_activity);
app.post('/delta_timeline', db_handler.delta_timeline);
app.post('/service_info', db_handler.service_info);
app.post('/file_activity', db_handler.file_activity);
app.post('/dmesg_aggregation', db_handler.dmesg_aggregation);
app.post('/application_trace', db_handler.application_trace);
app.post('/android_logs', db_handler.android_logs);
app.post('/dmesg', db_handler.dmesg);
app.post('/content_provider_browserhistory', db_handler.cp_browserhistory);
app.post('/content_provider_browsersearches', db_handler.cp_browsersearches);
app.post('/content_provider_applications', db_handler.cp_applications);
app.post('/content_provider_calllogs', db_handler.cp_calllogs);
app.post('/content_provider_contacts', db_handler.cp_contacts);
app.post('/content_provider_services', db_handler.cp_services);
app.post('/content_provider_sms', db_handler.cp_sms);
app.post('/content_provider_mms', db_handler.cp_mms);
app.post('/fs_time', db_handler.fs_time);
app.post('/inode_time', db_handler.inode_time);
app.post('/temporal_info', db_handler.temporal_info);
app.post('/package_info', db_handler.package_info);

app.listen(app.get('port'));
console.log("server started on [localhost:2222]");



