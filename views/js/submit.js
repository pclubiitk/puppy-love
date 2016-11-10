senderReqs = [];
senderRolls = [];
recvReqs = [];
recvRolls = [];

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function doStep1() {
    var data;
    toSendReqs.forEach(function(entry) {
        a0 = getRandomInt();
        a1 = getRandomInt();
        b0 = getRandomInt();
        b1 = getRandomInt();

        x0 = getRandomInt();
        x1 = getRandomInt();

        c0 = stringGen(120);
        c1 = stringGen(120);

        enc = shuffle([
            encryptAes(c0, a0+'-'+b0),
            encryptAes(c0, a0+'-'+b1),
            encryptAes(c0, a1+'-'+b0),
            encryptAes(c1, a1+'-'+b1)
        ]);

        _serverMap = {};
        _serverMap[c0] = 0;
        _serverMap[c1] = 1;
        data = {
            sender: myRoll,
            receiver: entry,
            serverMap: _serverMap,
            senderInfo: encryptRsa(JSON.stringify({
                a0: a0,
                a1: a1,
                b0: b0,
                b1: b1
            }), myPubk),
            recvInfo: JSON.stringify({
                x0: x0,
                x1: x1,
                N: myPriv.n.toString(16),
                e: 3,
                enc: enc
            })
        };

        postRequest(urls.step1,
                    data,
                    'Could not create entry for user: ' + entry,
                    function(data, status, jqXHR) {
                        console.log("Entry created for " + entry);
                    });
    });
};

function parseStatusResponse(type, callback) {
    return function(data, status, jqXHR) {
        if (type == 'receiver') {
            recvReqs = data;
            recvReqs.forEach(function(item) {
                recvRolls.push(''+item.sender);
            });
        } else {
            senderReqs = data;
            senderReqs.forEach(function(item) {
                senderRolls.push(''+item.receiver);
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
    doStep1();
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
