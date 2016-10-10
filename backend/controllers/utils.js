// Provides functions of global utility

exports.response = function(res, msg, code) {
    if (code === undefined) {
        code = 200;
    };
    res.status(code);
    res.send(msg);
};

// See if the request body has the given fields
exports.reqBodyParse = function(req, fields) {
    var result = true;
    for (var i=0; i<fields.length; i++) {
        if (req.body[fields[i]] === undefined) {
            result = false;
            break;
        };
    };
    return result;
};
