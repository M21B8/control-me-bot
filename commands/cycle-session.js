const {SlashCommandBuilder} = require('@discordjs/builders');
const {SessionService} = require('../services/SessionService.js');
const {PlayService} = require('../services/PlayService.js');
const Handler = require('../utils/HandlerUtils.js');

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
            interaction.reply("Session does not exist").catch(Handler.logError);
            return
        }

        clearInterval(session.interval)
        Object.values(session.links).forEach(link => {
            PlayService.stopControl(session, link)
        })

        session.interval = setInterval(function () {
            Object.values(session.links).forEach(link => {
                PlayService.stopControl(session, link)
            })
        }, session.playtime)
        interaction.reply("Started Session").catch(Handler.logError);
    },
};