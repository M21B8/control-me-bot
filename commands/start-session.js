const {SlashCommandBuilder} = require('@discordjs/builders');
const {SessionService} = require('../services/SessionService.js');
const {PlayService} = require('../services/PlayService.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Connects to a Lovense Link!')
        .addStringOption(option =>
            option.setName('session')
                .setDescription('The session id to join')
                .setRequired(false))
    ,
    async execute(interaction) {
        let sessionId = null;
        if (interaction.options.get('session') != null) {
            sessionId = interaction.options.get('session').value
        }
        const session = SessionService.getSession(sessionId, interaction.channel.id)
        if (session == null) {
            interaction.reply("Session does not exist").catch(e => {
                console.log("Failed to send response")
                console.log(e)
            });
            return
        }
        let links = [];
        for (const property in session.links) {
            links.push(session.links[property]);
        }

        setInterval(function () {
            if (!links.some(link => link.isSearching)) {
                let link = links.find(link => link.currentUser == null)
                if (link != null) {
                    if (session.users.length === 0) {
                        if (session.playedUsers.length !== 0) {
                            console.log("recycling played users")
                            session.users = session.playedUsers
                            session.playedUsers = []
                        }
                    }
                    return PlayService.giveControl(session, link)
                }
            }
        }, 1_000)

        session.interval = setInterval(function () {
            links.forEach(link => {
                PlayService.stopControl(session, link)
            })
            links = links.sort(() => 0.5 - Math.random())
        }, session.sessionPlaytime)
        interaction.reply("Started Session").catch(e => {
            console.log("Failed to send response")
            console.log(e)
        });
    },
};