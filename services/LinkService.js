const fetch = require('node-fetch');
const Handler = require('../utils/HandlerUtils.js')

const LinkServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const LinkService = function () {
    };

    LinkService.prototype.connect = async function (interaction, session) {
        let params = interaction.options.get('link').value
        const match = params.match(new RegExp('https://c.lovense.com/v2/(.*)$'))

        let connectCode = params
        if (match != null) {
            connectCode = match[1]
        }
        if (session.links[connectCode] != null) {
            console.log('already active link. weird huh?')
            return null
        }
        const response = await fetch("https://c.lovense.com/c/" + connectCode, {
            method: "GET"
        }).then(response => {
            return response;
        });
        if (response.status === 200 && response.url.indexOf(connectCode) === -1) {
            const nextUrl = response.url.replace("/ws/", "/ws2/");

            const response3 = await fetch(nextUrl, {method: 'GET'}).then(response => {
                return response;
            });

            let match = response3.url.match(new RegExp('.*play\/(.*)\\?email.*$'));

            if (match == null) {
                console.log("Invalid Link")
                return null;
            }
            let id = match[1]
            const link = {
                url: 'https://c.lovense.com/v2/' + connectCode,
                startingUser: interaction.user,
                connectCode: connectCode,
                id: id,
                speed: 0,
                altSpeed: 0,
                toys: [],
                controlTime: 300_000,
                maxSpeed: 100,
                maxAlt: 100
            }
            if (session.playtime != null && session.playtime > 0) {
                link.controlTime = session.playtime * 60_000
            }

            const response4 = await LinkService.prototype.ping(id)

            const json = await response4.json()
            if (json.status === 429) {
                console.log('Too many requests. FUCK!')
                return null
            }

            if (json.code === 400) {
                console.log("Link is invalid")
                return null
            }

            let toys = json.data.toyData
            Object.values(toys).forEach((v) => {
                link.toys.push({id: v.id, name: v.name})
            })

            console.log('Connected to: ' + connectCode);
            session.links[id] = link
            return link

        } else {
            console.log('Link already used');
            return null
        }
    };

    LinkService.prototype.ping = async function (id) {

        let connectUrl = "https://c.lovense.com/app/ws/loading/" + id

        return fetch(connectUrl, {method: 'GET', headers: {}});

    };

    LinkService.prototype.drop = async function (session, link) {
        if (link.timeout != null) {
            clearTimeout(link.countdown)
        }
        if (link.findController != null) {
            clearInterval(link.findController)
        }
        if (link.currentUser != null) {
            link.currentUser.send('This toy has been stopped. Hope you had fun!')
        }
        if (link.currentControlMessage != null) {
            Object.values(link.currentControlMessage).forEach(x => {
                if (x != null) {
                    x.delete().catch(Handler.logError);
                }
            })
            link.currentControlMessage = null
        }

        if (link.registrationMessage != null) {
            link.registrationMessage.delete().catch(Handler.logError);
            link.registrationMessage = null
        }
        console.log("Link " + link.id + "for " + link.startingUser.username + " has been dropped")
        delete session.links[link.id]
    }

    return {
        LinkService: new LinkService()
    }
}());

module.exports = LinkServiceModule;