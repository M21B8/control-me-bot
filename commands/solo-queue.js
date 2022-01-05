const {SlashCommandBuilder} = require('@discordjs/builders');
const {LinkService} = require('../services/LinkService.js')
const {SpeedService} = require('../services/SpeedService.js')
const {PlayService} = require('../services/PlayService.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('solo-queue')
        .setDescription('Connects to a Lovense Link!')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('The lovense control link')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('playtime')
                .setDescription('How long in minutes each person gets to play before it picks someone new.')
                .setRequired(false))
        .addBooleanOption(option =>
            option
                .setName("anonymous")
                .setDescription("This will prevent your name being show on the 'registration' screen")
                .setRequired(false)),
    async execute(interaction) {
        let link = await LinkService.connect(interaction)
        if (link != null) {
            link.heartbeat = setInterval(async function () {
                let response = await LinkService.ping(link.id)
                const data = await response.json()
                if (data.status === 429 || data.code === 400) {
                    clearInterval(link.heartbeat)
                    console.log('dropping')
                    await LinkService.drop(link)
                }
            }, 5000)
            await SpeedService.setSpeed(link, 1)
            await SpeedService.setSpeed(link, 0)
            PlayService.begin(interaction, link)
        }
    },
};