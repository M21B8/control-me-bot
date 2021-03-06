const {SlashCommandBuilder} = require('@discordjs/builders');
const {LinkService} = require('../services/LinkService.js')
const {SessionService} = require('../services/SessionService.js')
const {SpeedService} = require('../services/SpeedService.js')
const Handler = require('../utils/HandlerUtils.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join-session')
        .setDescription('Connects to a Lovense Link!')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('The lovense control link')
                .setRequired(true))
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
        let link = await LinkService.connect(interaction, session)
        if (link != null) {
            link.toys.forEach(t => t.maxSpeed = -1)
            link.heartbeat = setInterval(async function () {
                let response = await LinkService.ping(link.id)
                const data = await response.json()
                if (data.status === 429 || data.code === 400) {
                    console.log('dropping')
                    await LinkService.drop(session, link)
                }
            }, 5000)
            for (const toy of link.toys) {
                await SpeedService.setSpeed(link, toy.id, 1)
                await SpeedService.setSpeed(link, toy.id, 0)
            }
        }
        interaction.reply("Joined Session").catch(Handler.logError);
    },
};