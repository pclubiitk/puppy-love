// Displays errors neatly
function setErrorModal(errorMsg) {
    $("#errorDescription").text(errorMsg);
    $("#errorModal").modal("show");
};

base_url = '/api';

urls = {
    'login': base_url + '/login',
    'email': base_url + '/update/mail',
    'setpass': base_url + '/update/first'
};
