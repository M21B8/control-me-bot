const {SlashCommandBuilder} = require('@discordjs/builders');
const {SessionService} = require('../services/SessionService.js')
const Handler = require('../utils/HandlerUtils.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('max-speed')
        .setDescription('Creates a group Lovense Link!')
        .addIntegerOption(option =>
            option.setName('speed')
                .setDescription('The maximum speed you want the toy to run at (1-20).')
                .setRequired(true))
    ,
    async execute(interaction) {
        // has to be via DM
        const session = SessionService.findSessionForUser(interaction.user.id)
        if (session == null) {
            interaction.reply({
                content: "You don't appear to have a link active",
                ephemeral: true
            }).catch(Handler.logError);
        } else {
            const link = Object.values(session.links).find(link => link.startingUser.id === interaction.user.id)
            if (link == null) {
                interaction.reply({
                    content: "You don't appear to have a link active",
                    ephemeral: true
                }).catch(Handler.logError);
            } else {
                let maxSpeed = interaction.options.get('speed')
                if (maxSpeed != null) {
                    let speed = maxSpeed.value
                    if (speed < 1) {
                        speed = 1
                    } else if (speed > 20) {
                        speed = 20
                    }
                    link.toys.forEach(t => t.maxSpeed = speed)
                }
                interaction.reply({content: 'Max Speed has been updated', ephemeral: true}).catch(Handler.logError);
            }
        }
    },
};