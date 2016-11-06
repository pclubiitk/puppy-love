function checkPassword() {
    var user = $("#username").val();
    var passwd = $("#password").val();
    var loginData = {
        username: user,
        password: passwd
    };
    if (passwd.length < 4) {
        setErrorModal("Please provide a longer password");
    } else {
        $.ajax({
            type: "POST",
            url: urls.login,    // From utils.js
            data: JSON.stringify(loginData),
            contentType: "application/json; charset=utf-8",

            success: function (data, status, jqXHR) {
                console.log('Data: ' + data);
                console.log('Status: ' + status);
                console.log(jqXHR);

                // Store password in sessionStorage (not localStorage)
                sessionStorage.setItem('password', btoa(passwd));

                // Add a redirect here
            },
            error: function (jqXHR, status, error) {
                var errorMsg = '';

                // Important because JSON.parse can fail
                try {
                    errorMsg = (JSON.parse(jqXHR.responseText).message);
                } catch (e) {
                    errorMsg = error;
                }
                setErrorModal(errorMsg); // From utils.js
            }
        });
    }
}

$(document).ready(function() {
    $("#loginButton").click(checkPassword);
});
