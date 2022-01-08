const {SlashCommandBuilder} = require('@discordjs/builders');
const {SessionService} = require('../services/SessionService.js')
const {SessionMessageService} = require('../services/SessionMessageService.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('group')
        .setDescription('Creates a group Lovense Link!')
        .addIntegerOption(option =>
            option
                .setName('playtime')
                .setDescription('How long in minutes each person gets to play before it picks someone new.')
                .setRequired(false))
    ,
    async execute(interaction) {
        if (interaction.guild !== null) {
            let session = await SessionService.createSession();
            if (session != null) {
                interaction.deferReply().catch(e => {
                    console.log("Failed to send response")
                    console.log(e)
                });
                let playtime = interaction.options.get('playtime')
                if (playtime != null) {
                    session.playtime = playtime.value
                }
                session.startingUser = interaction.user;
                session.channelId = interaction.channel.id
                await SessionMessageService.sendSessionStart(interaction, session);
            } else {
                interaction.reply("Fuck").catch(e => {
                    console.log("Failed to send response")
                    console.log(e)
                });
            }
        } else {
            interaction.reply("Do this in a server dumbass").catch(e => {
                console.log("Failed to send response")
                console.log(e)
            });
        }

    },
};