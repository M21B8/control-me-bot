const {MessageEmbed} = require('discord.js');
const {SlashCommandBuilder} = require('@discordjs/builders');
const {PatternMessageService} = require('../services/PatternMessageService.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pattern-build')
        .setDescription('Create a Lovense pattern string'),
    async execute(interaction) {
        patternCompilation(interaction)
    },
};

function patternCompilation(interaction) {

    // Initial defaults
    let pattern = []
    pattern.steps = 0
    pattern.lastStep = 'N/A'

    // Fetch the message data from the Pattern Message Service and use it to DM the user
    let messageData = getPatternBuilderUI(interaction, pattern)
    interaction.user.send({embeds: messageData.embeds, components: messageData.components}).then((message) => {

        // Start the message and point the user to their DMs
        const messageCollector = message.createMessageComponentCollector()
        interaction.reply({ content: 'Check your DMs to build a pattern!', ephemeral: true })

        // Set some placeholder vars for values
        let patternString = ''
        let thisStep = ''
        let selectedLevel = ''
        let selectedDuration = ''

        messageCollector.on('collect', async (collected) => {
            collected.deferUpdate()
            switch (collected.customId) {
                case 'speedLevel':
                    selectedLevel = collected.values[0]
                    pattern.selectedLevel = selectedLevel
                    break;
                case 'speedDuration':
                    selectedDuration = collected.values[0]
                    pattern.selectedDuration = selectedDuration
                    break;
                case 'next':
                    // Put together this step string and add it to the pattern string
                    thisStep = (selectedLevel + ':' + selectedDuration + ';')
                    patternString += thisStep
                    // Increment the step counter and clear step values
                    pattern.steps++
                    pattern.lastStep = ('Speed ' + pattern.selectedLevel + ' for ' + pattern.selectedDuration + 'ms')
                    pattern.selectedLevel = false
                    pattern.selectedDuration = false
                    break;
                case 'end':
                    // Put together this step string and add it to the pattern string
                    thisStep = (selectedLevel + ':' + selectedDuration + ';')
                    patternString += thisStep
                    // Delete the UI message and output the finished string
                    message.delete()
                    pattern.steps++
                    interaction.user.send('Your ' + pattern.steps + ' step pattern string is: \n' + '`' + patternString + '`')
                    break;
            }
            if (collected.customId !== 'end') {
                // Update the message display to reflect new values
                messageData = getPatternBuilderUI(interaction, pattern)
                message.edit(messageData)
            }
        });
    });
}

function getPatternBuilderUI(interaction, pattern) {
    return PatternMessageService.setPatternStep(interaction.user, pattern)
}
