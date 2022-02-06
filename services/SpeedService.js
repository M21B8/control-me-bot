const {LovenseService} = require('../services/LovenseService.js')
const Toys = require('../constants/Toys.js')

const SpeedServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const SpeedService = function () {
    };

    SpeedService.prototype.setSpeed = async function (link, toyId, speed, isAlt = false) {
        let command = {
            cate: "id",
            id: {}
        }

        link.toys.forEach(toy => {
            let primarySpeed = toy.speed
            let altSpeed = toy.altSpeed

            if (toy.id === toyId) {
                if (isAlt) {
                    altSpeed = speed
                } else {
                    primarySpeed = speed
                }
            }

            command.id[toy.id] = {
                v: -1,
                v1: -1,
                v2: -1,
                p: -1,
                r: -1,
            }

            const toyInfo = Toys[toy.name]
            let primary = toyInfo.primary
            command.id[toy.id][primary] = primarySpeed

            if (toyInfo.hasAlternate) {
                let alt = toyInfo.alternate
                command.id[toy.id][alt] = altSpeed
            }
            toy.speed = primarySpeed
            toy.altSpeed = altSpeed
        })
        await LovenseService.call(link.id, command)

        return speed
    }

    SpeedService.prototype.stop = async function (link) {
        await this.setSpeed(link, 0)
        await this.setSpeed(link, 0, true)
    }

    return {
        SpeedService: new SpeedService()
    }
}());

module.exports = SpeedServiceModule;