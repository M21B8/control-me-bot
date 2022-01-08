const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
const {LinkService} = require('../services/LinkService')
const {SpeedService} = require('../services/SpeedService')
const {SessionService} = require('../services/SessionService')
const Toys = require('../constants/Toys.js')

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
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('A Lovense is available for control')
            .setAuthor('Lovense Bot')
            .setDescription('Someone on this server has enabled their toy for remote control.')
            .setThumbnail(imageUrl)
            .addField('Toy Type', toy.name + " - " + toy.emoji, true)

        if (!link.anonymous) {
            exampleEmbed.addField('Toy Owner', link.startingUser.username, true)
        }

        exampleEmbed
            .addField('Total Control Time', "" + link.totalTime + " mins", true)
            .addField('Individual Control Time', "" + (link.controlTime / 60_000) + " mins", true)

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

        await interaction.reply({
            content: 'Connected! You should have received a short pulse.',
            ephemeral: true
        }).catch(e => {
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
                if (session.users.filter(u => {
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
                        session.users.push(i.user)
                    }).catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                }
            } else if (i.customId === 'shutdown') {
                if (i.user.id === link.startingUser.id || i.user.id === '140920915797082114') {
                    await SpeedService.stop(link)
                    await LinkService.drop(session, link)
                    SessionService.endSession(session)
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

    return {
        SoloMessageService: new SoloMessageService()
    }
}());

module.exports = SoloMessageServiceModule;