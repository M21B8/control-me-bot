const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
const {LinkService} = require('../services/LinkService')
const {SpeedService} = require('../services/SpeedService')

const imageUrl = "https://i.imgur.com/46AQjlT.png"

const MessageServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const MessageService = function () {
    };

    MessageService.prototype.sendRegistration = async function (interaction, link) {

        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('A Lovense is available for control')
            .setAuthor('Lovense Bot')
            .setDescription('Someone on this server has enabled their toy for remote control.')
            .setThumbnail(imageUrl)
            .addField('Toy Type', link.toys[0].name, true)
            .setTimestamp();

        if (!link.anonymous) {
            exampleEmbed.addField('Toy Owner', link.startingUser.username)
        }

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('signup')
                    .setLabel('Sign Up')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('shutdown')
                    .setLabel('Shutdown')
                    .setStyle('DANGER'),
            )
        ;

        await interaction.reply({content: 'Connected! You should have received a short pulse.', ephemeral: true}).catch(e => {
            console.log("Failed to send response")
            console.log(e)
        });
        const m = await interaction.followUp({embeds: [exampleEmbed], components: [row]}).catch(e => {
            console.log("Failed to send response")
            console.log(e)
        });

        const collector = interaction.channel.createMessageComponentCollector();

        collector.on('collect', async i => {
            if (i.customId === 'signup') {
                if (link.users.filter(u => {
                    return u.username === i.user.username
                }).length > 0) {
                    console.log(i.user.username + " is already registered")
                    await i.reply({content: 'You are already in the queue!', ephemeral: true}).catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                } else {
                    await i.reply({content: 'You have joined the queue!', ephemeral: true}).then(() => {
                        console.log("Registering " + i.user.username)
                        link.users.push(i.user)
                    }).catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                }
            } else if (i.customId === 'shutdown') {
                if (i.user.id === link.startingUser.id || i.user.id === '140920915797082114') {
                    await SpeedService.stop(link)
                    await LinkService.drop(link)
                    await i.reply({content: 'Toy stopped!'}).catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                } else {
                    i.reply(i.user.username + " - Please don't try to stop someone else's toy.").catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                }
            }
        });

        link.registrationMessage = m
    };

    MessageService.prototype.pingUser = async function (link, user) {
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Its your turn to control someone')
            .setAuthor('Lovense Bot')
            .setDescription("Please confirm you're here")
            .setThumbnail(imageUrl)
            .addField('Toy Type', link.toys[0].name, true)
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

        console.log('Pinging user: ' + user.username)
        return user.send({embeds: [exampleEmbed], components: [row]})
    };

    MessageService.prototype.sendControls = async function (link, user) {
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Its your turn to control someone')
            .setAuthor('Lovense Bot')
            .setDescription("Your controls are below")
            .setThumbnail(imageUrl)
            .addField('Toy Type', link.toys[0].name, true)
            .addField('Primary Speed', '' + link.speed, true)
            .addField('Alternate Speed', '' + link.altSpeed, true)
            .setTimestamp();

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
        let primary = await user.send({embeds: [primarySpeed], components: rows}).catch(e => {
            console.log("Failed to send response")
            console.log(e)
        });

        let alt = null
        if (link.toys[0].name === "nora" || link.toys[0].name === "edge" || link.toys[0].name === "max") {
            const altSpeed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Alternate');
            const extraRows = buildControlPanel("alt-", "SECONDARY")
            alt = await user.send({embeds: [altSpeed], components: extraRows}).catch(e => {
                console.log("Failed to send response")
                console.log(e)
            });
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