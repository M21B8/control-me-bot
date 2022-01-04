const fetch = require('node-fetch');
const FormData = require('form-data')
const {LinkService} = require('../services/LinkService.js')

const SpeedServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const SpeedService = function () {
        this.links = [];
    };

    const toyControl = {
        "nora": {p: "v", a: "r"},
        "edge": {p: "v1", a: "v2"},
        "max": {p: "v", a: "p"}
    }

    SpeedService.prototype.setSpeed = async function (link, speed, isAlt = false) {

        let command = {
            cate: "id",
            id: {}
        }

        let toy = link.toys[0]

        let primarySpeed = link.speed
        let altSpeed = link.altSpeed

        if (isAlt) {
            altSpeed = speed
        } else {
            primarySpeed = speed
        }

        command.id[toy.id] = {
            v: -1,
            v1: -1,
            v2: -1,
            p: -1,
            r: -1,
        }

        const overrides = toyControl[toy.name]
        let primary = "v"
        let alt = "r"
        if (overrides != null) {
            primary = overrides.p
            alt = overrides.a
        }
        command.id[toy.id][primary] = primarySpeed
        command.id[toy.id][alt] = altSpeed

        let formData = new FormData();
        formData.append('order', JSON.stringify(command));
        let commandUrl = "https://c.lovense.com/app/ws/command/" + link.id
        await fetch(commandUrl, {method: 'POST', body: formData}).then(response => {
            return response;
        });

        link.speed = primarySpeed
        link.altSpeed = altSpeed

        console.log("speed set to: " + speed)
        return speed
    }

    SpeedService.prototype.stop = async function (link) {
        await this.setSpeed(link, 0)
        await this.setSpeed(link, 0, true)
        return
    }

    return {
        SpeedService: new SpeedService()
    }
}());

module.exports = SpeedServiceModule;