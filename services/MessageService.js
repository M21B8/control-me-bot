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

        await interaction.reply({content: 'Connected! You should have received a short pulse.', ephemeral: true});
        const m = await interaction.followUp({embeds: [exampleEmbed], components: [row]});

        const collector = interaction.channel.createMessageComponentCollector();

        collector.on('collect', async i => {
            if (i.customId === 'signup') {
                if (link.users.filter(u => {
                    return u.username === i.user.username
                }).length > 0) {
                    console.log(i.user.username + " is already registered")
                    await i.reply({content: 'You are already in the queue!', ephemeral: true});
                } else {
                    console.log("Registering " + i.user.username)
                    link.users.push(i.user)
                    await i.reply({content: 'You have joined the queue!', ephemeral: true}).catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                }
            } else if (i.customId === 'shutdown') {
                if (i.user.id === link.startingUser.id) {
                    await SpeedService.stop(link)
                    await LinkService.drop(link)
                    await i.reply({content: 'Toy stopped!'});
                } else {
                    i.reply(i.user.username + " - Please don't try to stop someone else's toy.")
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


        return user.send({embeds: [exampleEmbed], components: [row]})
    };

    MessageService.prototype.sendControls = function (link, user) {
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Its your turn to control someone')
            .setAuthor('Lovense Bot')
            .setDescription("Your controls are below")
            .setThumbnail(imageUrl)
            .addField('Toy Type', link.toys[0].name, true)
            .addField('Current Speed', '' + link.speed, true)
            .setTimestamp();

        const row1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('stop')
                    .setLabel("Stop")
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('max')
                    .setLabel('Max')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('pass')
                    .setLabel('Pass Control')
                    .setStyle('PRIMARY'),
            );
        const rowA = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('one')
                    .setLabel('1')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('two')
                    .setLabel('2')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('three')
                    .setLabel('3')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('four')
                    .setLabel('4')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('five')
                    .setLabel('5')
                    .setStyle('PRIMARY'),
            );
        const rowB = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('six')
                    .setLabel('6')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('seven')
                    .setLabel('7')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('eight')
                    .setLabel('8')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('nine')
                    .setLabel('9')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('ten')
                    .setLabel('10')
                    .setStyle('PRIMARY'),
            );
        const rowC = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('eleven')
                    .setLabel('11')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('twelve')
                    .setLabel('12')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('thirteen')
                    .setLabel('13')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('fourteen')
                    .setLabel('14')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('fifteen')
                    .setLabel('15')
                    .setStyle('PRIMARY'),
            );
        const rowD = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('sixteen')
                    .setLabel('16')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('seventeen')
                    .setLabel('17')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('eighteen')
                    .setLabel('18')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('nineteen')
                    .setLabel('19')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('twenty')
                    .setLabel('20')
                    .setStyle('PRIMARY'),
            );

        return user.send({embeds: [exampleEmbed], components: [row1, rowA, rowB, rowC, rowD]})
    };

    return {
        MessageService: new MessageService()
    }
}());

module.exports = MessageServiceModule;