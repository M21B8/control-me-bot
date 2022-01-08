const {MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {LinkService} = require('../services/LinkService.js')
const {SpeedService} = require('../services/SpeedService.js')
const {SessionService} = require('../services/SessionService.js')
const {PlayService} = require('../services/PlayService.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('solo')
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
        let session = SessionService.createSession()
        let link = await LinkService.connect(interaction, session)
        if (link != null) {
            link.heartbeat = setInterval(async function () {
                let response = await LinkService.ping(link.id)
                const resp = await response.json()
                if (resp.status === 429 || resp.code === 400) {
                    clearInterval(link.heartbeat)
                    console.log('dropping')
                    await LinkService.drop(session, link)
                } else if (resp.data != null && resp.data.timeLeft == null) {
                    link.timeLeft = resp.data.leftTime
                }
            }, 5000)
            await SpeedService.setSpeed(link, 1)
            await SpeedService.setSpeed(link, 0)
            PlayService.begin(interaction, session, link)
        }
    },
};