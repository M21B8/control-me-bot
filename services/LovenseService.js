const fetch = require('node-fetch');
const FormData = require('form-data')

const LovenseServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const LovenseService = function () {
    };

    LovenseService.prototype.connect = async function (connectCode) {
        return fetch("https://c.lovense.com/c/" + connectCode, {
            method: "GET"
        }).then(response => {
            if (response.status === 200 && response.url.indexOf(connectCode) === -1) {
                const nextUrl = response.url.replace("/ws/", "/ws2/");

                return fetch(nextUrl, {method: 'GET'});
            } else {
                console.log('Link already used');
                return "Link has already been used"
            }
        });

        // return Promise.resolve({
        //     ok: true,
        //     status: 200,
        //     url: "http://localhost:8080/play/1234?email=abc",
        //     json: () => {
        //         return {};
        //     },
        // })
    }

    LovenseService.prototype.ping = async function (id) {
        return fetch("https://c.lovense.com/app/ws/loading/" + id, {method: 'GET', headers: {}});

        // return Promise.resolve({
        //     ok: true,
        //     json: () => {
        //         return {
        //             data: {
        //                 toyData: {
        //                     '123': {
        //                         id: '123',
        //                         name: 'dolce'
        //                     }
        //                 }
        //             }
        //         };
        //     },
        // })
    };

    LovenseService.prototype.call = async function (id, command) {
        let formData = new FormData();
        formData.append('order', JSON.stringify(command));
        let commandUrl = "https://c.lovense.com/app/ws/command/" + id
        return fetch(commandUrl, {method: 'POST', body: formData});

        // return Promise.resolve({
        //     ok: true,
        //     json: () => {
        //         return {};
        //     },
        // })
    }

    return {
        LovenseService: new LovenseService()
    }
}());

module.exports = LovenseServiceModule;