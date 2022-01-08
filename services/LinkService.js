const fetch = require('node-fetch');

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

            let id = response3.url.match(new RegExp('.*play\/(.*)\\?email.*$'))[1];

            const link = {
                url: 'https://c.lovense.com/v2/' + connectCode,
                startingUser: interaction.user,
                connectCode: connectCode,
                id: id,
                speed: 0,
                altSpeed: 0,
                toys: [],
                controlTime: 60_000,
                maxSpeed: 100,
                maxAlt: 100
            }
            const playParams = interaction.options.get('playtime')
            if (playParams != null) {
                link.controlTime = playParams.value * 60_000
            }
            if (session.sessionPlaytime != null) {
                link.controlTime = -1
            }
            const anon = interaction.options.get('anonymous')
            if (anon != null) {
                link.anonymous = anon.value
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
            console.log(json.data.leftTime)
            console.log(json.data.leftTime / 60)
            console.log(Math.round(json.data.leftTime / 60))
            link.totalTime = Math.round(json.data.leftTime / 60)
            console.log(link.totalTime)
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

        return await fetch(connectUrl, {method: 'GET', headers: {}}).then(response => {
            return response;
        });

    };

    LinkService.prototype.getLink = async function (linkId) {
        delete this.links[linkId]
    }
    LinkService.prototype.drop = async function (session, link) {
        if (link.currentUser != null) {
            link.currentUser.send('This toy has been stopped. Hope you had fun!')
        }
        if (link.currentControlMessage !== null) {
            for (const property in link.currentControlMessage) {
                let x = link.currentControlMessage[property]
                if (x != null) {
                    await x.delete().catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                }
            }
            link.currentControlMessage = null
        }

        if (link.registrationMessage != null) {
            link.registrationMessage.delete().catch(e => {
                console.log("Failed to send response")
                console.log(e)
            });
        }
        delete session.links[link.id]
    }

    return {
        LinkService: new LinkService()
    }
}());

module.exports = LinkServiceModule;