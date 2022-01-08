const {SlashCommandBuilder} = require('@discordjs/builders');
const {SessionService} = require('../services/SessionService.js');
const {PlayService} = require('../services/PlayService.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cycle')
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
        clearInterval(session.interval)
        links.forEach(link => {
            PlayService.prototype.stopControl(session, link)
        })
        session.interval = setInterval(function () {
            links.forEach(link => {
                PlayService.prototype.giveControl(session, link)
            })
        }, session.sessionPlaytime)
        interaction.reply("Started Session").catch(e => {
            console.log("Failed to send response")
            console.log(e)
        });
    },
};