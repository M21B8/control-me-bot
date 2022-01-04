const fetch = require('node-fetch');

const LinkServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const LinkService = function () {
        this.links = {};
    };

    LinkService.prototype.connect = async function (interaction) {
        let params = interaction.options.get('link').value
        const match = params.match(new RegExp('https://c.lovense.com/v2/(.*)$'))

        let connectCode = params
        if (match != null) {
            connectCode = match[1]
        }
        if (this.links[connectCode] != null) {
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
                startingUser: interaction.user,
                connectCode: connectCode,
                id: id,
                speed: -1,
                altSpeed: -1,
                users: [],
                playedUsers: [],
                timeoutUsers: [],
                toys: [],
                controlTime: 60_000
            }
            const playParams = interaction.options.get('playtime')
            if (playParams != null) {
                link.controlTime = playParams.value * 60_000
            }
            const anon = interaction.options.get('anonymous')
            if (anon != null) {
                link.anonymous = anon.value
            }

            const response4 = await LinkService.prototype.ping(id)

            const data = await response4.json()
            if (data.status === 429) {
                console.log('Too many requests. FUCK!')
                return null
            }

            if (data.code === 400) {
                console.log("Link is invalid")
                return null
            }

            let toys = data.data.toyData
            for (var t in toys) {
                link.toys.push({id: t, name: toys[t].name})
            }
            this.links[id] = link

            console.log('Connected to: ' + connectCode);
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
    LinkService.prototype.drop = async function (link) {
        if (link.currentUser != null) {
            link.currentUser.send('This toy has been stopped. Hope you had fun!')
        }
        if (link.currentControlMessage !== null) {
            for (const property in link.currentControlMessage) {
                let x = link.currentControlMessage[property]
                if (x != null) {
                    await x.delete()
                }
            }
            link.currentControlMessage = null
        }

        if (link.registrationMessage != null) {
            link.registrationMessage.delete();
        }
        delete this.links[link.id]
    }

    return {
        LinkService: new LinkService()
    }
}());

module.exports = LinkServiceModule;