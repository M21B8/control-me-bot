const {SlashCommandBuilder} = require('@discordjs/builders');
const {SessionService} = require('../services/SessionService.js')
const {PlayService} = require('../services/PlayService.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Creates a group Lovense Link!')
    ,
    async execute(interaction) {
        // has to be via DM
        const session = SessionService.findSessionForUser(interaction.user.id)
        if (session == null) {
            interaction.reply({content: "You don't appear to have a link active", ephemeral: true}).catch(e => {
                console.log("Failed to send response")
                console.log(e)
            });
        } else {
            const link = Object.values(session.links).find(link => link.startingUser.id === interaction.user.id)
            if (link == null) {
                interaction.reply({content: "You don't appear to have a link active", ephemeral: true}).catch(e => {
                    console.log("Failed to send response")
                    console.log(e)
                });
            } else {
                console.log(link.startingUser.username + " - has forcibly skipped their controller (" + link.currentUser.username + ")")
                await PlayService.stopControl(session, link)
                interaction.reply({
                    content: 'Controller will be skipped (assuming there is another one)',
                    ephemeral: true
                })
            }
        }
    },
};