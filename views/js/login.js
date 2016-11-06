function checkPassword() {
    var user = $("#username").val();
    var passwd = $("#password").val();
    //var user = '14588';
    //var passwd = 'abcd';
    var loginData = {
        username: user,
        password: passwd
    };
    if (passwd.length < 4) {
        setErrorModal("Please provide a longer password");
    } else {
        sessionStorage.setItem('localSecret', btoa(passwd));
        base_url = "/api";
        url = base_url + "/login";
        $.post(url, loginData, function(something) {
            console.log('yaya');
            if (something.redirect) {
                // data.redirect contains the string URL to redirect to
                console.log('redirecting');
                window.location.href = data.redirect;
                window.location = data.redirect;
            } else {
                console.log('na na na na');
            }
        }).done(function() {
            console.log('done');
        }).always(function() {
            console.log('alwaysssss');
        }).fail(function() {
            console.log('soemtimes we fail');
        })

        $.ajax({
            type: "POST",
            url: url,
            data: loginData,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                console.log('inside');
                if (response.d == true) {
                    alert("You will now be redirected.");
                    window.location = "http://www.aspsnippets.com/";
                }
            },
            failure: function (response) {
                console.log('outside');
                alert(response.d);
            }
        });
        // Check password from backend
        // If it was true, you will also get the encrypted
        // private key and public key
        // Save them to the local storage too
    }
}

function loginCheck() {
    checkPassword();
}

$(document).ready(function() {
    $("#loginButton").click(loginCheck);
});

$(document).ready(function() {
    console.log("hello");
});
