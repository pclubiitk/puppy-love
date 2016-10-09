exports.register = function(db) {

    return function(req, res) {
        // Basic information needed
        if (req.body['passhash'] === undefined ||
            req.body['pubkey']   === undefined ||
            req.body['privkey']  === undefined) {
            res.status(400);
            res.send('Missing field(s)');

            return;
        }

        // Authentication code unique to each person
        if (req.body['authcode'] == undefined) {
            res.status(401);
            res.send('Auth code not sent');
            return;
        }

        res.status(501);
        res.send('Yet to implement :)');
    }
};
