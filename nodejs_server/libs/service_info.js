
var cursor;
cursor = db.ServiceInfo.find({name: application_name}, {_id: 0});

var result = [];
while(cursor.hasNext()) {
    result.push(cursor.next());
}

printjson(result);

