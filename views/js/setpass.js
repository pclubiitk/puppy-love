function setPass() {
    var roll = $("#roll").val();
    var pass = $("#password").val();
    var code = $("#authcode").val();
    var cpass = $("#config-password").val();
    var privKey = genPrivKey();
    console.log(privKey);
    if (pass === cpass || !roll || !code || !pass) {
        var loginData = {
            roll: roll,
            passHash: hashPass(pass), // From utils.js
            authCode: code
        };

        // Required fields:
        // 'authCode', 'passHash', 'pubKey', 'privKey'
        // TODO: Add pubKey and privKey to loginData

        $.ajax({
            type: "POST",
            url: urls.setpass,    // From utils.js
            data: JSON.stringify(loginData),
            contentType: "application/json; charset=utf-8",

            success: function (data, status, jqXHR) {
                console.log('Data: ' + data);
                console.log('Status: ' + status);
                console.log(jqXHR);

                // Add a redirect here
                document.location.href = '/index.html';
                window.location = '/index.html';
                window.location.href = '/index.html';
            },
            error: function (jqXHR, status, error) {
                var errorMsg = 'Could not save your password';

                // Important because JSON.parse can fail
                try {
                    errorMsg = (JSON.parse(jqXHR.responseText).message);
                } catch (e) {
                    errorMsg = error;
                }
                setErrorModal(errorMsg); // From utils.js
            }
        });
    } else {
        if (pass !== cpass) {
            setErrorModal('Passwords do not match');
        } else {
            setErrorModal('Missing field');
        }
    };
}

$(document).ready(function() {
    $("#register-submit").click(setPass);
});
