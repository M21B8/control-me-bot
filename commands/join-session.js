const {SlashCommandBuilder} = require('@discordjs/builders');
const {LinkService} = require('../services/LinkService.js')
const {SessionService} = require('../services/SessionService.js')
const {SpeedService} = require('../services/SpeedService.js')

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
            interaction.reply("Session does not exist").catch(e => {
                console.log("Failed to send response")
                console.log(e)
            });
            return
        }
        let link = await LinkService.connect(interaction, session)
        if (link != null) {
            link.heartbeat = setInterval(async function () {
                let response = await LinkService.ping(link.id)
                const data = await response.json()
                if (data.status === 429 || data.code === 400) {
                    clearInterval(link.heartbeat)
                    console.log('dropping')
                    await LinkService.drop(session, link)
                }
            }, 5000)
            await SpeedService.setSpeed(link, 1)
            await SpeedService.setSpeed(link, 0)
        }
        interaction.reply("Joined Session").catch(e => {
            console.log("Failed to send response")
            console.log(e)
        });
    },
};