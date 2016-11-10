// Displays errors neatly
function setErrorModal(errorMsg) {
    $("#errorDescription").text(errorMsg);
    $("#errorModal").modal("show");
};

base_url = '/api';

urls = {
    'login': base_url + '/login',
    'logout': base_url + '/logout',
    'email': base_url + '/update/mail',
    'setpass': base_url + '/update/first',
    'getinfo': base_url + '/info/login',
    'removech': base_url + '/update/data',
    'sendstatus': base_url + '/twoparty/sendstat',
    'recvstatus': base_url + '/twoparty/recvstat'
};

function redirect(loc) {
    document.location.href = loc;
    window.location = loc;
    window.location.href = loc;
};

function decryptAes(item, password) {
    return atob(CryptoJS.AES.decrypt(item, password).toString(CryptoJS.enc.Utf8));
};

function encryptAes(item, password) {
    return CryptoJS.AES.encrypt(btoa(item), password).toString();
};

function decryptRsa(item, key) {
    return atob((cryptico.decrypt(item, key)).plaintext);
};

// Remember, this takes a secret key
function encryptRsa(item, key) {
    return cryptico.encrypt(btoa(item), key).cipher;
};

function hashPass(item) {
    return CryptoJS.SHA256(btoa(item)).toString(CryptoJS.enc.Hex);
};

function genPrivKey(pass) {
    return cryptico.generateRSAKey(pass, 512);
};

function postRequest(_url, _data, _errorMsg, _callback) {
    $.ajax({
        type: "POST",
        url: _url,
        data: _data,
        success: _callback,
        error: function (jqXHR, status, error) {
            var errorMsg = _errorMsg || '';
            // Important because JSON.parse can fail
            try {
                errorMsg = (JSON.parse(jqXHR.responseText).message);
            } catch (e) {
                errorMsg = error;
            }
            setErrorModal(errorMsg); // From utils.js
        }
    });
};

function getRequest(_url, _errorMsg, _callback) {
    $.ajax({
        type: "GET",
        url: _url,
        success: _callback,
        error: function (jqXHR, status, error) {
            var errorMsg = _errorMsg || '';
            // Important because JSON.parse can fail
            try {
                errorMsg = (JSON.parse(jqXHR.responseText).message);
            } catch (e) {
                errorMsg = error;
            }
            setErrorModal(errorMsg); // From utils.js
        }
    });
};
