var myPass = '';
var myPriv = '';
var myPubk = '';
var myData = '';
var backendData;
var searchData;
var searchDiv;

function gotInfo(data, status, jqXHR) {
    console.log('Data: ' + data);
    console.log('Status: ' + status);
    console.log(jqXHR);

    backendData = data;

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

    // THE hack of the century
    myPriv = cryptico.generateRSAKey(btoa(myPass), 512);

    // Decrypt and store all variables
    try {
        myData = decryptRsa(backendData.data, myPriv);
    } catch (e) {
        console.error("Could not parse private data");
        console.error(e);
    }

    // It can be empty though
    if (myData == null || myData == undefined) {
        setErrorModal("Something is wrong with your private data");
    } else {
        myPubk = cryptico.publicKeyString(myPriv);
        sessionStorage.setItem("privKey", myPriv);
        console.log(myData);
    };

    // To receive male/female data for searching
    getSearchOptions();
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

function logout() {
    $.ajax({
        type: "GET",
        url: urls.logout,    // From utils.js
        success: function(data, status, jqXHR) {
            console.log('Data: ' + data);
            console.log('Status: ' + status);
            console.log(jqXHR);

            // Add a redirect here
            redirect('/'); // From utils.js
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
};

function getSearchOptions() {
    gender = "male";
    if (backendData.gender) gender = "female";
    url = "/static/" + gender;
    $.ajax({
        type: "GET",
        url: url,    // From utils.js
        success: function(data, status, jqXHR) {
            searchData = [];
            data.split('\n').forEach (function(entry) {
                elems = entry.split(',\ ');
                roll = elems[0];
                name = elems[1].toUpperCase();
                img = elems[2];
                searchData.push({
                    roll: roll,
                    name: name,
                    img: img
                });
            });
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

function search() {
    searchDiv.innerHTML = "";
    toSearch = $("#label_search").val().toUpperCase();
    if (toSearch.length >= 3) {
        searchData.forEach(function(searchElem) {
            name = searchElem.name;
            if (name.indexOf(toSearch) !== -1) {
                roll = searchElem.roll;
                searchDiv.innerHTML += "<button type=\"button\" class=\"list-group-item\">" + name + " (" + roll + ")</button>\n";
            }
        });
    }
}

$(document).ready(function() {
    searchDiv = document.getElementById("list_search");
    getAndPopulate();
    $("#label_logout").click(logout);
    $("#label_search").keyup(search);
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
