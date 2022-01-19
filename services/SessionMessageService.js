const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');
const {SessionService} = require('../services/SessionService.js')
const {SpeedService} = require('../services/SpeedService.js')
const Handler = require('../utils/HandlerUtils.js')

const imageUrl = "https://i.imgur.com/46AQjlT.png"

const SessionMessageServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const SessionMessageService = function () {
    };

    SessionMessageService.prototype.sendSessionStart = async function (interaction, session) {
        const exampleEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('A Group Lovense session has been started')
            .setAuthor('Lovense Bot')
            .setDescription("/join-session link: ")
            .addField("Session Id", session.id, true)
            .setThumbnail(imageUrl)
            .setTimestamp();
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

        exampleEmbed
            .addField('Controllers', "" + (session.users.length + session.playedUsers.length), true)
            .addField('Controlees', "" + Object.keys(session.links).length, true)


        session.startMessage = await interaction.followUp({embeds: [exampleEmbed], components: [row]}).catch(Handler.logError);

        const collector = session.startMessage.createMessageComponentCollector();

        collector.on('collect', async i => {
            if (i.customId === 'signup') {
                if (session.users.filter(u => {
                    return u.username === i.user.username
                }).length > 0) {
                    console.log(i.user.username + " is already registered")
                    await i.reply({content: 'You are already in the queue!', ephemeral: true}).catch(Handler.logError);
                } else {
                    await i.reply({content: 'You have joined the queue!', ephemeral: true}).then(() => {
                        console.log("Registering " + i.user.username)
                        session.users.push(i.user)
                    }).catch(Handler.logError);
                }
            } else if (i.customId === 'shutdown') {
                if (i.user.id === session.startingUser.id || i.user.id === '140920915797082114') {
                    Object.values(session.links).forEach(link => {
                        SpeedService.stop(link)
                    });
                    SessionService.endSession(session)

                    i.reply("Group session has been ended").catch(Handler.logError);
                } else if (i.user.id === '883867369250885633') {
                    i.reply("🖕🖕🖕 I'm fucking done wid y'all 🖕🖕🖕.").catch(Handler.logError);
                } else {
                    i.reply(i.user.username + " - Please don't try to stop someone else's toy.").catch(Handler.logError);
                }
            }
        });
    };

    SessionMessageService.prototype.updateControllerCount = async function (session) {
        let main = session.startMessage
        if (main != null) {
            main.embeds[0].fields[1].value = "" + (session.users.length + session.playedUsers.length)
            main.embeds[0].fields[2].value = "" + Object.keys(session.links).length
            await main.edit({embeds: [new MessageEmbed(main.embeds[0])]}).catch(Handler.logError);
        }
    }

    return {
        SessionMessageService: new SessionMessageService()
    }
}());

module.exports = SessionMessageServiceModule;