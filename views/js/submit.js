senderReqs = [];
senderRolls = [];
recvReqs = [];
recvRolls = [];

function parseStatusResponse(type, callback) {
    return function(data, status, jqXHR) {
        if (type == 'receiver') {
            recvReqs = data;
            recvReqs.forEach(function(item) {
                recvRolls.push(item.roll);
            });
        } else {
            senderReqs = data;
            senderReqs.forEach(function(item) {
                senderRolls.push(item.roll);
            });
        };
        console.log("Fetched: " + type);
        callback();
    };
};

function getListOfNotSentPeople() {
    toSendReqs = $(toSendReqs).not(senderRolls).get();
    toSendReqs = $(toSendReqs).not(recvRolls).get();
    senderRolls = [];
    recvRolls = [];
    console.log(toSendReqs);
};

function getStatusOfSubmissions() {
    // Get list of people where this person is
    // the receiver, parse it, and then compute the final list
    getRecvData = function() {
        return getRequest(
            urls.recvstatus,
            'Could not get submission status',
            parseStatusResponse('receiver', getListOfNotSentPeople));
    };

    // Get list of people where this person is
    // the sender, parse it, and the call getRecvData
    getRequest(
        urls.sendstatus,
        'Could not get submission status',
        parseStatusResponse('sender', getRecvData)
    );
};
