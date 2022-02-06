const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
const Toys = require('../constants/Toys.js')
const ToyUtils = require('../utils/ToyUtils.js')
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
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle("It's your turn to take control")
            .setAuthor('Lovense Bot')
            .setDescription("Please confirm that you're ready to take control now by clicking the 'I'm Ready' button. If you aren't able to take control, please click 'I changed my mind' and you will be removed from the controller queue")
            .setThumbnail(imageUrl)
            .setTimestamp();

        exampleEmbed.addField('Toy Type', ToyUtils.formatToyName(link), true)

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
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('You have control')
            .setAuthor('Lovense Bot')
            .setDescription("Your controls are below. If you wish to stop controlling, 'Pass Control' will give control to the next user but keep you in the queue. 'Leave' will give control to the next user but remove you from the queue (you can rejoin from the original menu if you want to).")
            .setThumbnail(imageUrl)

        exampleEmbed
            .addField('Toy Type', ToyUtils.formatToyName(link), true)

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
        let controlEmbeds = {
            main: main,
            toys: {}
        }

        let sendToyControl = async function(toy) {
            const iToy = Toys[toy.name];
            const primarySpeed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(iToy.name + " - " + (iToy.primaryName != null ? iToy.primaryName : 'Vibration'));
            let rows = buildControlPanel(toy.maxSpeed, "")
            let primary = await user.send({embeds: [primarySpeed], components: rows}).catch(Handler.logError);
            let alt = null
            if (iToy.hasAlternate) {
                const altSpeed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(iToy.name + " - " + iToy.alternateName);
                const extraRows = buildControlPanel(toy.maxSpeed, "alt-", "SECONDARY")
                alt = await user.send({embeds: [altSpeed], components: extraRows}).catch(Handler.logError);
            }
            controlEmbeds.toys[toy.id] = {
                primary: primary,
                alternate: alt
            }
        }

        for (const toy of link.toys) {
            await sendToyControl(toy)
        }

        return controlEmbeds;
    };

    const labels = {
        1: 'one',
        2: 'two',
        3: 'three',
        4: 'four',
        5: 'five',
        6: 'six',
        7: 'seven',
        8: 'eight',
        9: 'nine',
        10: 'ten',
        11: 'eleven',
        12: 'twelve',
        13: 'thirteen',
        14: 'fourteen',
        15: 'fifteen',
        16: 'sixteen',
        17: 'seventeen',
        18: 'eighteen',
        19: 'nineteen',
        20: 'twenty',
    }

    function buildControlPanel(maxSpeed, prefix, colour = "SUCCESS") {
        const controlRow = new MessageActionRow()
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

        const row1 = new MessageActionRow()
        const row2 = new MessageActionRow()
        const row3 = new MessageActionRow()
        const row4 = new MessageActionRow()
        if (maxSpeed === -1) {
            maxSpeed = 20;
        }
        for (let i = 1; i <= maxSpeed; i++) {
            let row = null
            if (i <= 5) {
                row = row1
            } else if (i <= 10) {
                row = row2
            } else if (i <= 15) {
                row = row3
            } else if (i <= 20) {
                row = row4
            } else {
                return
            }
            row.addComponents(
                new MessageButton()
                    .setCustomId(prefix + labels[i])
                    .setLabel('' + i)
                    .setStyle(colour)
            )
        }
        let rows = [controlRow]
        if (maxSpeed >= 1) {
            rows.push(row1)
        }
        if (maxSpeed >= 6) {
            rows.push(row2)
        }
        if (maxSpeed >= 11) {
            rows.push(row3)
        }
        if (maxSpeed >= 16) {
            rows.push(row4)
        }
        return rows
    }

    return {
        MessageService: new MessageService()
    }
}());

module.exports = MessageServiceModule;