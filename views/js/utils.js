// Displays errors neatly
function setErrorModal(errorMsg) {
    $("#errorDescription").text(errorMsg);
    $("#errorModal").modal("show");
};

base_url = '/api';

urls = {
    'login': '/api' + '/login'
};
