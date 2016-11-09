var myPass = '';
var myPriv = '';
var myPubk = '';
var myData = '';
var myRoll = '';
var backendData;
var searchData;
var searchDiv;
var selectedChoices = [];

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
    myRoll = sessionStorage.getItem('roll');

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
        displayChoices(myData); // Updates the database
    };

    // To receive male/female data for searching
    getSearchOptions();
};

function dataDisplayChoices(myDataPass) {
    var choice;
    try {
        var parseData = JSON.parse(myDataPass);
        for (choice in parseData.choices) {
            selectedChoices.push(choice);
        };
    } catch (e) {
        console.error("Empty private data?");
    };

    var tmp = {
        img: 'http://oa.cc.iitk.ac.in/Oa/Jsp/Photo/14588_0.jpg',
        name: 'Saksham Sharma',
        roll: '14588'
    };

    selectedChoices.push(tmp);

    displayChoices();
};

function displayChoices() {
    var newdiv, divthumb, img, caption;
    for (var i=0; i<selectedChoices.length; i++) {
        console.log(selectedChoices[i]);
        newdiv = document.createElement('div');
        newdiv.setAttribute('class', 'col-sm-6 col-md-4');
        newdiv.setAttribute('id', 'choice-' + selectedChoices[i].roll);

        divthumb = document.createElement('div');
        divthumb.setAttribute('class', 'thumbnail');

        img = document.createElement('img');
        img.setAttribute('src', selectedChoices[i].img);

        caption = document.createElement('div');
        caption.setAttribute('class', 'caption');
        caption.innerHTML = "<p class='text-center'>" +
            selectedChoices[i].name +
            " - " + selectedChoices[i].roll + "</p>" +
            "<p class='text-center'>" +
            "<a id='remove-"+ selectedChoices[i].roll +
            "' class='remove-btn btn btn-default'" +
            " role='button' onclick=removeUser(" +
            selectedChoices[i].roll + ")>Remove?</a>" + "</p>";

        divthumb.appendChild(img);
        divthumb.appendChild(caption);
        newdiv.appendChild(divthumb);
        $("#choices-row").append(newdiv);
    };
};

function removeUser(rollToRemove) {
    $("#choice-" + rollToRemove).remove();
    for (var i=0; i<selectedChoices; i++) {
        if (selectedChoices[i].roll == rollToRemove) {
            selectedChoices.splice(i, 1);
            break;
        }
    }

    var newData = encryptRsa(JSON.stringify(selectedChoices), myPubk);
    updateData(newData);        // Update on backend
};

function addUser(rollToAdd) {
    searchDiv.innerHTML = "";
    $("#label_search").val("");

    var len;
    len = selectedChoices.length;

    if (len > 4) {
        setErrorModal("You can only add up to 4 choices");
        return;
    }

    for (i=0; i<len; i++) {
        if (selectedChoices[i].roll == rollToAdd) {
            setErrorModal('You are not allowed to add a person multiple times');
            return;
        }
    }

    len = searchData.length;
    for (var i=0; i<len; i++) {
        if (searchData[i].roll == rollToAdd) {
            selectedChoices.push(searchData[i]);
            break;
        }
    }

    displayChoices();

    var newData = encryptRsa(JSON.stringify(selectedChoices), myPubk);
    updateData(newData);        // Update on backend
};

function updateData(dataToUpdate) {
    $.ajax({
        type: "POST",
        url: urls.removech,    // From utils.js
        data: {
            roll: parseInt(myRoll),
            data: dataToUpdate
        },
        success: function (jqXHR, status, error) {
            console.log("Saved data on backend");
        },
        error: function (jqXHR, status, error) {
            var errorMsg = "Could not save your data";
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
                if (entry != "") {
                    elems = entry.split(',\ ');
                    searchData.push({
                        roll: elems[0],
                        name: elems[1].toUpperCase(),
                        img: elems[2]
                    });
                }
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
};

function search() {
    searchDiv.innerHTML = "";
    toSearch = $("#label_search").val().toUpperCase();
    if (toSearch.length >= 4) {
        searchData.forEach(function(searchElem) {
            name = searchElem.name;
            if (name.indexOf(toSearch) !== -1) {
                roll = searchElem.roll;
                searchDiv.innerHTML += "<button onclick=addUser('" + roll +
                    "') type=\"button\" class=\"list-group-item\">" + name
                    + " (" + roll + ")</button>\n";
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
