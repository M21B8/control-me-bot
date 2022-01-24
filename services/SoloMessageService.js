const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
const {PlayService} = require('../services/PlayService')
const Toys = require('../constants/Toys.js')
const ServerPings = require('../constants/ServerPings.js')
const UserUtils = require('../utils/UserUtils.js')
const Handler = require('../utils/HandlerUtils.js')

const imageUrl = "https://i.imgur.com/46AQjlT.png"

const SoloMessageServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const SoloMessageService = function () {
    };


    SoloMessageService.prototype.sendRegistration = async function (interaction, session, link) {
        let toy = Toys[link.toys[0].name]
        let ServerPing = ServerPings[interaction.guildId]
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('A Lovense is available for control')
            .setAuthor('Lovense Bot')
            .setDescription('Someone on this server has enabled their toy for remote control.')
            .setThumbnail(imageUrl)
            .addField('Instructions', "Click 'Queue to take Control' to join the queue of controllers. When it's your turn, the bot will send you a DM to check that you're ready to take over control. If you wish to leave the queue, please press 'Leave the Queue'")
            .addField('Toy Type', toy.name + " - " + toy.emoji, true)
            .addField('Controllers in Queue (played)', "" + session.users.length + "(" + session.playedUsers.length + ")", true)

        if (!link.anonymous) {
            exampleEmbed.addField('Toy Owner', link.startingUser.username, true)
        }

        exampleEmbed
            .addField('Individual Control Time', "" + Math.round(link.controlTime / 60_000) + " mins", true)

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('signup')
                    .setLabel('Queue to take Control')
                    .setStyle('PRIMARY'),
                new MessageButton()
                    .setCustomId('leave')
                    .setLabel('Leave the Queue')
                    .setStyle('SECONDARY'),
            )
        ;

        const m = await interaction.channel.send({
            content: ServerPing,
            embeds: [exampleEmbed],
            components: [row]
        }).catch(Handler.logError);
        const collector = m.createMessageComponentCollector({});

        collector.on('collect', async i => {
            if (i.customId === 'signup') {
                if (UserUtils.isUserRegistered(session, i.user)) {
                    console.log(i.user.username + " is already registered")
                    await i.reply({content: 'You are already in the queue!', ephemeral: true}).catch(Handler.logError);
                } else {
                    await i.reply({content: 'You have joined the queue!', ephemeral: true}).then(() => {
                        console.log("Registering " + i.user.username + ' for (' + link.startingUser.username + ')')
                        session.users.push(i.user)
                    }).catch(Handler.logError);
                }
            } else if (i.customId === 'leave') {
                UserUtils.findUserControlLinks(session, i.user).forEach(link => PlayService.stopControl(session, link, true))
                session.users = session.users.filter(u => {
                    return u.id !== i.user.id
                })
                session.timeoutUsers = session.timeoutUsers.filter(u => {
                    return u.id !== i.user.id
                })
                session.playedUsers = session.playedUsers.filter(u => {
                    return u.id !== i.user.id
                })
                i.reply({content: 'You have been removed. Goodbye!', ephemeral: true}).catch(Handler.logError);
            }
        });

        link.registrationMessage = m
    };

    SoloMessageService.prototype.sendPostSession = async function (session, link) {
        let toy = Toys[link.toys[0].name]
        let timePeriod = 0;
        if (link.startTimestamp != null) {
            timePeriod = Math.round((new Date() - link.startTimestamp) / 60000)
        }

        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Session Finished')
            .setAuthor('Lovense Bot')
            .setDescription('This Lovense Session has finished.')
            .setThumbnail(imageUrl)
            .addField('Toy Type', toy.name + " - " + toy.emoji, true)
            .addField("Control Time", "" + timePeriod + " minutes", true)

        link.registrationMessage.edit({embeds: [exampleEmbed], components: []})
    }

    SoloMessageService.prototype.updateControllerCount = async function (session, link) {
        let main = link.registrationMessage
        if (main != null) {
            main.embeds[0].fields[2].value = "" + session.users.length + "(" + session.playedUsers.length + ")"
            await main.edit({embeds: [new MessageEmbed(main.embeds[0])]}).catch(Handler.logError);
        }
    }

    return {
        SoloMessageService: new SoloMessageService()
    }
}());

module.exports = SoloMessageServiceModule;