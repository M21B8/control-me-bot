const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
const Toys = require('../constants/Toys.js')
const Handler = require('../utils/HandlerUtils.js')

const imageUrl = "https://i.imgur.com/46AQjlT.png"

const MessageServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const MessageService = function () {
    };

    MessageService.prototype.pingUser = async function (link, user) {
        let toy = Toys[link.toys[0].name]
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Its your turn to control someone')
            .setAuthor('Lovense Bot')
            .setDescription("Please confirm you're here")
            .setThumbnail(imageUrl)
            .addField('Toy Type', toy.name + " - " + toy.emoji, true)
            .setTimestamp();

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('ping-yes')
                    .setLabel("I'm Ready")
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('ping-no')
                    .setLabel('I changed my mind')
                    .setStyle('PRIMARY'),
            );

        console.log('Pinging for (' + link.startingUser.username + ') : ' + user.username + "")
        return user.send({embeds: [exampleEmbed], components: [row]})
    };

    MessageService.prototype.sendControls = async function (link, user) {
        let toy = Toys[link.toys[0].name]
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Its your turn to control someone')
            .setAuthor('Lovense Bot')
            .setDescription("Your controls are below")
            .setThumbnail(imageUrl)
            .addField('Toy Type', toy.name + " - " + toy.emoji, true)
            .addField('Vibration', '' + link.speed, true);
        if (toy.hasAlternate) {
            exampleEmbed.addField(toy.alternateName, '' + link.altSpeed, true);
        }
        exampleEmbed.addField("Timer", '' + link.timeLeft)
        exampleEmbed.setTimestamp();

        const topRow = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('pass')
                    .setLabel('Pass Control')
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setCustomId('leave')
                    .setLabel('Leave')
                    .setStyle("DANGER"),
            );

        let main = await user.send({embeds: [exampleEmbed], components: [topRow]})

        const primarySpeed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Vibration');

        let rows = buildControlPanel("")
        let primary = await user.send({embeds: [primarySpeed], components: rows}).catch(Handler.logError);

        let alt = null
        if (toy.hasAlternate) {
            const altSpeed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(toy.alternateName);
            const extraRows = buildControlPanel("alt-", "SECONDARY")
            alt = await user.send({embeds: [altSpeed], components: extraRows}).catch(Handler.logError);
        }
        return [main, primary, alt];
    };

    function buildControlPanel(prefix, colour = "SUCCESS") {
        const row1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(prefix + 'stop')
                    .setLabel("Stop")
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'max')
                    .setLabel('Max')
                    .setStyle(colour),
            );
        const rowA = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(prefix + 'one')
                    .setLabel('1')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'two')
                    .setLabel('2')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'three')
                    .setLabel('3')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'four')
                    .setLabel('4')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'five')
                    .setLabel('5')
                    .setStyle(colour),
            );
        const rowB = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(prefix + 'six')
                    .setLabel('6')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'seven')
                    .setLabel('7')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'eight')
                    .setLabel('8')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'nine')
                    .setLabel('9')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'ten')
                    .setLabel('10')
                    .setStyle(colour),
            );
        const rowC = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(prefix + 'eleven')
                    .setLabel('11')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'twelve')
                    .setLabel('12')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'thirteen')
                    .setLabel('13')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'fourteen')
                    .setLabel('14')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'fifteen')
                    .setLabel('15')
                    .setStyle(colour),
            );
        const rowD = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(prefix + 'sixteen')
                    .setLabel('16')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'seventeen')
                    .setLabel('17')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'eighteen')
                    .setLabel('18')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'nineteen')
                    .setLabel('19')
                    .setStyle(colour),
                new MessageButton()
                    .setCustomId(prefix + 'twenty')
                    .setLabel('20')
                    .setStyle(colour),
            );
        return [row1, rowA, rowB, rowC, rowD]
    }

    return {
        MessageService: new MessageService()
    }
}());

module.exports = MessageServiceModule;