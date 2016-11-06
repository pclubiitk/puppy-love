// Generate a public-private keypair
function genKey(passwd) {
    if (typeof(Storage) !== "undefined" && false) {
        if (passwd.length < 4) {
            setErrorModal("Password is too short.");
        } else {
            keyPair = cryptico.generateRSAKey(passwd, 1024);
            pubKey = cryptico.publicKeyString(keyPair);
            sessionStorage.setItem('keyPair', JSON.stringify(keyPair));
            sessionStorage.setItem('pubKey', JSON.stringify(pubKey));
        }
    } else {
        // There's no local storage!
        setErrorModal("Please use a modern browser");
    }
}
