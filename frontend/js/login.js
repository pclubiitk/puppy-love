function checkPassword() {
    passwd = $("#password-field").val()
    if (passwd.length < 4) {
        setErrorModal("Please provide a longer password");
    } else {
        sessionStorage.setItem('localSecret', btoa(passwd));
        // Check password from backend
        // If it was true, you will also get the encrypted
        // private key and public key
        // Save them to the local storage too
    }
}

function loginCheck() {
    setKey();
}

$(document).ready(function() {
    $("#loginButton").click(loginCheck);
});
