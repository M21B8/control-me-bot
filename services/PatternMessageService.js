const {MessageActionRow, MessageButton, MessageSelectMenu, MessageEmbed} = require('discord.js');

const imageUrl = "https://i.imgur.com/46AQjlT.png"

const PatternMessageServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const PatternMessageService = function () {
    };

    PatternMessageService.prototype.setPatternStep = function (user, pattern) {
        const patternSpeedEmbed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Create a Lovense pattern string')
            .setAuthor('Lovense Bot')
            .setDescription("Use the controls below to create a string for use with the \n /pattern-once \n /pattern-loop \n commands during a session.")
            .addField('Number of steps:', '#' + pattern.steps, true)
            .addField('The previous step was:', '' + pattern.lastStep, true)
            .setThumbnail(imageUrl)
            .setTimestamp();

        let buttonsDisabled = (pattern.selectedLevel && pattern.selectedDuration) ? false : true

        const row1 = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('speedLevel')
                    .setPlaceholder('Select a speed level')
                    .addOptions([
						{
							label: '1',
							value: '1',
                            default: (pattern.selectedLevel === '1'),
						},
                        {
							label: '2',
							value: '2',
                            default: (pattern.selectedLevel === '2'),
						},
                        {
                            label: '3',
                            value: '3',
                            default: (pattern.selectedLevel === '3'),
                        },
                        {
                            label: '4',
                            value: '4',
                            default: (pattern.selectedLevel === '4'),
                        },
                        {
                            label: '5',
                            value: '5',
                            default: (pattern.selectedLevel === '5'),
                        },
                        {
                            label: '6',
                            value: '6',
                            default: (pattern.selectedLevel === '6'),
                        },
                        {
                            label: '7',
                            value: '7',
                            default: (pattern.selectedLevel === '7'),
                        },
                        {
                            label: '8',
                            value: '8',
                            default: (pattern.selectedLevel === '8'),
                        },
                        {
                            label: '9',
                            value: '9',
                            default: (pattern.selectedLevel === '9'),
                        },
                        {
                            label: '10',
                            value: '10',
                            default: (pattern.selectedLevel === '10'),
                        },
                        {
                            label: '11',
                            value: '11',
                            default: (pattern.selectedLevel === '11'),
                        },
                        {
                            label: '12',
                            value: '12',
                            default: (pattern.selectedLevel === '12'),
                        },
                        {
                            label: '13',
                            value: '13',
                            default: (pattern.selectedLevel === '13'),
                        },
                        {
                            label: '14',
                            value: '14',
                            default: (pattern.selectedLevel === '14'),
                        },
                        {
                            label: '15',
                            value: '15',
                            default: (pattern.selectedLevel === '15'),
                        },
                        {
                            label: '16',
                            value: '16',
                            default: (pattern.selectedLevel === '16'),
                        },
                        {
                            label: '17',
                            value: '17',
                            default: (pattern.selectedLevel === '17'),
                        },
                        {
                            label: '18',
                            value: '18',
                            default: (pattern.selectedLevel === '18'),
                        },
                        {
                            label: '19',
                            value: '19',
                            default: (pattern.selectedLevel === '19'),
                        },
                        {
                            label: '20',
                            value: '20',
                            default: (pattern.selectedLevel === '20'),
                        },
					]),
            );
        const row2 = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('speedDuration')
                    .setPlaceholder('Select the number of seconds to hold this speed')
                    .addOptions([
                        {
                            label: '¼ second',
                            value: '250',
                            default: (pattern.selectedDuration === '250'),
                        },
                        {
                            label: '½ second',
                            value: '500',
                            default: (pattern.selectedDuration === '500'),
                        },
                        {
                            label: '1 second',
                            value: '1000',
                            default: (pattern.selectedDuration === '1000'),
                        },
                        {
                            label: '1½ seconds',
                            value: '1500',
                            default: (pattern.selectedDuration === '1500'),
                        },
                        {
                            label: '2 seconds',
                            value: '2000',
                            default: (pattern.selectedDuration === '2000'),
                        },
                        {
                            label: '2½ seconds',
                            value: '2500',
                            default: (pattern.selectedDuration === '2500'),
                        },
                        {
                            label: '3s',
                            value: '3000',
                            default: (pattern.selectedDuration === '3000'),
                        },
                        {
                            label: '3½ seconds',
                            value: '3500',
                            default: (pattern.selectedDuration === '3500'),
                        },
                        {
                            label: '4 seconds',
                            value: '4000',
                            default: (pattern.selectedDuration === '4000'),
                        },
                        {
                            label: '4½ seconds',
                            value: '4500',
                            default: (pattern.selectedDuration === '4500'),
                        },
                        {
                            label: '5 seconds',
                            value: '5000',
                            default: (pattern.selectedDuration === '5000'),
                        },
                    ]),
            );
        const row3 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('next')
                    .setLabel('Submit & Add Next Step')
                    .setStyle('PRIMARY')
                    .setDisabled(buttonsDisabled),
                new MessageButton()
                    .setCustomId('end')
                    .setLabel('Submit & End Pattern')
                    .setStyle('SECONDARY')
                    .setDisabled(buttonsDisabled),
            );

        return {embeds: [patternSpeedEmbed], components: [row1, row2, row3]}
    };

    return {
        PatternMessageService: new PatternMessageService()
    }
}());

module.exports = PatternMessageServiceModule;
