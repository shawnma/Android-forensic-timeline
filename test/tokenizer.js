


function tokenize(object, target) {
    var pid_re = new RegExp(/(?:pid=\d+)|(?:pid:\d+)|(?:pid\s\d+)/);
    var uid_re = new RegExp(/(?:uid=\d+)/);
    var gid_re = new RegExp(/(?:gids=\{\d+,\s\d+\})/);
    var bracket_re = new RegExp(/\{.*\}|\(.*\)/ig);
    var black_list = ["proc", "Process", "for", ":", "has", ""];
    var tokens = [];

    //TODO remove following vars
    var re = new RegExp(/\{.*\}|\(.*\)/ig); // unified expression within brackets
    var numeric_re = new RegExp(/^\d+$/);
    var filter_list = ["proc", "Process", "for", ":", "has", ""];
    var unified_msg = target;
    var matches = re.exec(target);
    var detected_ids = [];

    // tokenize am_proc_start
    if (object === "am_proc_start") {
        var stripped_msg = target.substr(1, target.length - 2);
        var tokens_buf = stripped_msg.split(',');
        var pid = "pid=" + tokens_buf[0];
        var uid = "uid=" + tokens_buf[1];
        var app = tokens_buf[2];
        var type = tokens_buf[3];
        var intent = tokens_buf[4];
        tokens.push(pid);
        tokens.push(uid);
        tokens.push(app);
        tokens.push(type);
        tokens.push(intent);
        return tokens;
    }

    // tokenize am_proc_dies, am_proc_bound
    if (object === "am_proc_died" || object === "am_proc_bound") {
        var stripped_msg = target.substr(1, target.length - 2);
        var tokens_buf = stripped_msg.split(',');
        var pid = "pid=" + tokens_buf[0];
        var app = tokens_buf[1];
        tokens.push(pid);
        tokens.push(app);
        return tokens;
    }

    // tokenize activity manager
    if (object === "ActivityManager") {
        target = target.replace(/\.$/, '');
        var pid = pid_re.exec(target);
        if (pid !== null) {
            pid = pid[0].replace(/\s|:/, '='); //TODO need to verify the match will be one or many
            tokens.push(pid);
        }        
        var gid = gid_re.exec(target);
        if (gid !== null) {
            gid = gid[0].replace(/\{|\}|,/g, '');
            gid = gid.replace(/=/, ' ');
            tokens.push(gid);
        }
        var uid = uid_re.exec(target);
        if (uid !== null) {
            tokens.push(uid[0]);
        }
        var msg = target.replace(bracket_re, '');
        msg = msg.replace(/pid.*\d\s/, '');
        msg = msg.replace(/uid.*\d\s/, '');
        msg = msg.replace(/gids=.*/, '');
        msg = msg.replace(/:/, ' ');
        msg.split(' ').forEach(function(token) {
            if (black_list.indexOf(token) === -1)
                tokens.push(token);
        });
        return tokens;
    }

    // other messages
    if (matches !== null) {
        matches.forEach(function(matched_token) {
            var unified_token = matched_token.replace(/(,\s)|\s|,/, ' '); // replace the inner punctuations with space
            unified_msg = unified_msg.replace(matched_token, unified_token); 
        });
    }
    var escaped_msg = unified_msg.replace(/{|}|\(|\)|\[|\]|;/g, ''); // escape all brackets and `;` in message
    var tokenize_buf = escaped_msg.replace(/(:\s)/g, ' '); // replace `: ` with single space
    matches = pid_re.exec(tokenize_buf); // extract pids
    if (matches !== null) {
        matches.forEach(function(matched_id) {
            var pid = matched_id.split(/=|\s|:/)[1];  
            if (detected_ids.indexOf(pid) === -1)
                detected_ids.push(pid);
        });
    }
    matches = uid_re.exec(tokenize_buf); // extract uids
    if (matches !== null) {
        matches.forEach(function(matched_id) {
            var uid = matched_id.split(/=|\s|:/)[1];  
            if (detected_ids.indexOf(uid) === -1)
                detected_ids.push(uid);
        });
    }
    matches = gid_re.exec(tokenize_buf); // extract gids
    if (matches !== null) {
        matches.forEach(function(matched_id) {
            var gids = matched_id.split(/=/)[1];
            gids.split(' ').forEach(function(gid) {
                detected_ids.push(gid); 
            });
        });
    }
    tokenize_buf = tokenize_buf.replace(/\.$/g, ''); // remove the `.` at the end of the message
    var tokens_buf = tokenize_buf.split(/\s|,|=/); // split string by space or `,` or `=`
    tokens_buf.forEach(function(token_buf) {
        if (token_buf !== "" && !numeric_re.test(token_buf) && filter_list.indexOf(token_buf) === -1) tokens.push(token_buf); // remove empty token generated by replacement above
    });
    return [tokens, detected_ids];
}


