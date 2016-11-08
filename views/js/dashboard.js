var myPass = '';
var myPriv = '';
var myPubk = '';
var myData = '';

function gotInfo(data, status, jqXHR) {
    console.log('Data: ' + data);
    console.log('Status: ' + status);
    console.log(jqXHR);

    var backendData = data;

    // Greet the user and show his/her info
    $("#your_image").attr("src", backendData.image);
    $("#your_name").setGreeting(backendData.name);
    $("#your_gender").html(function() {
        if (backendData.gender) return "Male";
        else return "Female";
    }());

    // Display submitted information
    if (backendData.submitted) {
        $("label#label_submit").addClass("btn-info");
        $("span#span_submit").addClass("glyphicon-ok");
    } else {
        $("label#label_submit").addClass("btn-warning");
        $("span#span_submit").addClass("glyphicon-remove");
    };

    // This is in base64, store global
    myPass = atob(sessionStorage.getItem('password'));

    // Decrypt and store all variables
    myPriv = decryptAes(backendData.privKey, myPass);

    if (!myPriv) {
        setErrorModal("Something is wrong with your private data");
    } else {
        // Rest of the stuff proceeds if there is a private key
        sessionStorage.setItem("privKey", myPriv);
        myData = decryptRsa(backendData.data, myPriv);
    };
};

function getAndPopulate() {
    $.ajax({
        type: "POST",
        url: urls.getinfo,    // From utils.js
        success: gotInfo,
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
};

$(document).ready(function() {
    getAndPopulate();
});

// Credits: http://www.jqueryscript.net
(function ($) {
    $.fn.setGreeting = function(username){
        var now = new Date().getHours();
        var text, color;

        if (now >= 6 && now < 12){
            text = 'Good Morning,';
            color = '#008100';
        }
        else if (now >= 12 && now < 17){
            text = 'Hello,';
            color = '#CC7A29';
        }
        else if (now >= 17 && now < 22 ){
            text = 'Good Evening,';
            color = '#005CE6';
        }
        else{
            text = 'Good Night,';
            color = '#001C53';
        }

        return this.each(function(){
            var $div = $(this);

            $div.html(text + ' ' + username);
            // $div.css({
            //     'padding': '5px 10px',
            //     'backgroundColor': color,
            //     'color': '#fff'
            // });
        });
    };
}(jQuery));
