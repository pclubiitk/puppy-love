function sendEmail() {
    var roll = $("#roll").val();
    var loginData = {
        roll: roll
    };
    $.ajax({
        type: "POST",
        url: urls.email,    // From utils.js
        data: JSON.stringify(loginData),
        contentType: "application/json; charset=utf-8",

        success: function (data, status, jqXHR) {
            console.log('Data: ' + data);
            console.log('Status: ' + status);
            console.log(jqXHR);

            // Add a redirect here
            document.location.href = '/setpass.html';
            window.location = '/setpass.html';
            window.location.href = '/setpass.html';
        },
        error: function (jqXHR, status, error) {
            var errorMsg = 'Mailing failed';

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

$(document).ready(function() {
    $("#register-submit").click(sendEmail);
});
