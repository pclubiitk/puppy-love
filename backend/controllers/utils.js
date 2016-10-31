// Provides functions of global utility

// See if the request body has the given fields
exports.reqBodyParse = function(req, fields) {
    var result = true;
    for (var i=0; i<fields.length; i++) {
        if (req.body[fields[i]] === undefined) {
            result = false;
            console.error('Missing: ' + fields[i]);
            break;
        };
    };
    return result;
};

exports.messages = {
    unauthorized: {
        success: false,
        code: 401,
        data: 'Unauthorized request'
    },
    missingFields: {
        success: false,
        code: 404,
        data: 'Missing fields'
    },
    wrongAuthCode: {
        success: false,
        code: 400,
        data: 'Wrong authentication code'
    },
    dbError: {
        success: false,
        code: 501,
        data: 'Database error'
    },
    wrongUser: {
        success: false,
        code: 404,
        data: 'Wrong user'
    },
    allFine: {
        success: true,
        code: 200,
        data: 'Success'
    },
    allFineWithData: function(_data) {
        return {
            success: true,
            code: 200,
            data: _data
        };
    }
};

exports.sendMessage = function(res, message) {
    res.status(message.code);
    res.send(message.data);
};
