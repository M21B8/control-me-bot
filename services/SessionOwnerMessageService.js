const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
const {LinkService} = require('../services/LinkService')
const {SpeedService} = require('../services/SpeedService')
const {SessionService} = require('../services/SessionService')
const ToyUtils = require('../utils/ToyUtils.js')
const Handler = require('../utils/HandlerUtils.js')

const imageUrl = "https://i.imgur.com/46AQjlT.png"

const SessionOwnerMessageServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const SessionOwnerMessageService = function () {
    };

    SessionOwnerMessageService.prototype.sendOwnerPanel = async function (session, link) {
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle("Your toy is now active")
            .setAuthor('Lovense Bot')
            .setDescription("Your toy is now active to be controlled.")
            .setThumbnail(imageUrl)
            .setTimestamp();

        exampleEmbed.addField('Toy Type', ToyUtils.formatToyName(link), true)

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('shutdown')
                    .setLabel('Stop the Session')
                    .setStyle('DANGER'),
            );

        console.log('Sending Owner panel to ' + link.startingUser.username)
        const m = await link.startingUser.send({embeds: [exampleEmbed], components: [row]}).catch(Handler.logError);
        const collector = m.createMessageComponentCollector({});

        collector.on('collect', async i => {
            if (i.customId === 'shutdown') {
                link.terminated = true
                session.terminated = true
                await SpeedService.stop(link)
                await LinkService.drop(session, link)
                SessionService.endSession(session)
                m.delete().catch(Handler.logError);
                i.reply('Your toy has been stopped');
            }
        });

        link.registrationMessage = m

    };

    return {
        SessionOwnerMessageService: new SessionOwnerMessageService()
    }
}());

module.exports = SessionOwnerMessageServiceModule;