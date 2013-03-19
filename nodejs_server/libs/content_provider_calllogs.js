

exports.EVENT_SCHEMA =
{
    date: Number,
    duration: Number,
    type: String,
    number: String,
    name: String
};

exports.log_collections = ['CallLog'];

exports.name = "content_provider_calllogs";

exports.fields = [
    "date",
    "duration",
    "type",
    "number",
    "name"
];