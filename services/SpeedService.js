const fetch = require('node-fetch');
const FormData = require('form-data')
const {LinkService}  = require('../services/LinkService.js')

const SpeedServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const SpeedService = function () {
        this.links = [];
    };


    SpeedService.prototype.setSpeed = async function (link, speed) {

        let command = {
            cate: "id",
            id: {}
        }

        let toys = link.toys

        command.id[toys[0].id] = {
            v: speed,
            v1: -1,
            v2: -1,
            p: -1,
            r: -1,
        }

        let formData = new FormData();
        formData.append('order', JSON.stringify(command));
        let commandUrl = "https://c.lovense.com/app/ws/command/" + link.id
        await fetch(commandUrl, {method: 'POST', body: formData}).then(response => {
            return response;
        });

        link.speed = speed

        console.log("speed set to: " + speed)
        return speed
    }

    SpeedService.prototype.speedUp = async function (link, amount = 1) {
        return this.setSpeed(link, link.speed + amount)
    }

    SpeedService.prototype.speedDown = async function (link, amount = 1) {
        return this.setSpeed(link, link.speed - amount)
    }

    SpeedService.prototype.stop = async function (link) {
        return this.setSpeed(link, 0)
    }
    SpeedService.prototype.max = async function (link) {
        return this.setSpeed(link, 20)
    }

    return {
        SpeedService: new SpeedService()
    }
}());

module.exports = SpeedServiceModule;