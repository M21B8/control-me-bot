const fetch = require('node-fetch');
const FormData = require('form-data')

const LovenseServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const LovenseService = function () {
    };

    LovenseService.prototype.call = async function (id, command) {
        let formData = new FormData();
        formData.append('order', JSON.stringify(command));
        let commandUrl = "https://c.lovense.com/app/ws/command/" + id
        return fetch(commandUrl, {method: 'POST', body: formData});
    }

    return {
        LovenseService: new LovenseService()
    }
}());

module.exports = LovenseServiceModule;