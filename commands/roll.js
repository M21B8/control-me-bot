const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Rolls a dice!')
        .addIntegerOption(option =>
            option
                .setName('custom')
                .setDescription('How big a dice to roll')
                .setRequired(false))
    ,
    async execute(interaction) {
        let max = 50
        const opt = interaction.options.get('custom')
        if (opt != null) {
            max = opt.value;
        }
        let result = Math.floor((Math.random() * max) + 1)
        interaction.reply('Your D' + max + ' rolled.... ' + result + '!').catch(e => {
            console.log(e)
        })
    },
};