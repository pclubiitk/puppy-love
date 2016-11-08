// Displays errors neatly
function setErrorModal(errorMsg) {
    $("#errorDescription").text(errorMsg);
    $("#errorModal").modal("show");
};

base_url = '/api';

urls = {
    'login': base_url + '/login',
    'email': base_url + '/update/mail',
    'setpass': base_url + '/update/first',
    'getinfo': base_url + '/info/login'
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
    return atob(cryptico.decrypt(item, key));
};

function encryptRsa(item, key) {
    return cryptico.encrypt(btoa(item), key);
};

function hashPass(item) {
    return CryptoJS.SHA256(btoa(item));
};

function genPrivKey(pass) {
    return cryptico.generateRSAKey(pass, 512);
};
