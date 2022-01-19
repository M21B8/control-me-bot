const {SlashCommandBuilder} = require('@discordjs/builders');
const {LinkService} = require('../services/LinkService.js')
const {SpeedService} = require('../services/SpeedService.js')
const {SessionService} = require('../services/SessionService.js')
const {PlayService} = require('../services/PlayService.js')
const {SoloMessageService} = require('../services/SoloMessageService.js');
const {SessionOwnerMessageService} = require('../services/SessionOwnerMessageService.js');
const Handler = require('../utils/HandlerUtils.js');

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
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('max-speed')
                .setDescription('The maximum speed you want the toy to run at (1-20). Default is 20.')
                .setRequired(false))
    ,

    async execute(interaction) {
        let session = SessionService.createSession()
        let playtime = interaction.options.get('playtime')
        if (playtime != null) {
            session.playtime = playtime.value
        }
        let link = await LinkService.connect(interaction, session)
        if (link != null) {
            let maxSpeed = interaction.options.get('max-speed')
            if (maxSpeed != null) {
                let speed = maxSpeed.value
                if (speed < 1) {
                    speed = 1
                } else if (speed > 20) {
                    speed = 20
                }
                link.maxSpeed = speed
            } else {
                link.maxSpeed = -1
            }
            const anon = interaction.options.get('anonymous')
            if (anon != null) {
                link.anonymous = anon.value
            }
            link.heartbeat = setInterval(async function () {
                let response = await LinkService.ping(link.id)
                const resp = await response.json()
                if (resp.status === 429 || resp.code === 400) {
                    clearInterval(link.heartbeat)
                    await LinkService.drop(session, link)
                }
            }, 5000)
            await SpeedService.setSpeed(link, 1)
            await SpeedService.setSpeed(link, 0)

            await interaction.reply({
                content: 'Connected! You should have received a short pulse.',
                ephemeral: true
            }).catch(Handler.logError);

            await SessionOwnerMessageService.sendOwnerPanel(session, link )
            await SoloMessageService.sendRegistration(interaction, session, link)
            link.findController = setInterval(function () {
                SoloMessageService.updateControllerCount(session, link)
                if (link.currentUser != null || link.isSearching) {
                    return
                }
                if (session.users.length === 0) {
                    if (session.playedUsers.length !== 0) {
                        console.log("recycling played users")
                        session.users = session.playedUsers
                        session.playedUsers = []
                    }
                }
                console.log('Giving Control: Top level interval')
                return PlayService.giveControl(session, link)
            }, 5000)
        }
    },
};
