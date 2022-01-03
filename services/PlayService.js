const {MessageEmbed} = require('discord.js');
const {SpeedService} = require('../services/SpeedService.js');
const {MessageService} = require('../services/MessageService.js');

const PlayServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const PlayService = function () {
    };

    function selectNewUser(link) {
        let userIndex = Math.floor((Math.random() * link.users.length) + 1) - 1;
        return link.users[userIndex]
    }

    function removeUser(link, user) {
        link.users = link.users.filter((item) => {
            return item !== user
        })
    }

    function pollForUser(link) {
        setInterval(function () {
            if (link.currentUser != null || link.isSearching) {
                return
            }
            if (link.users.length === 0) {
                if (link.playedUsers.length !== 0) {
                    console.log("recycling played users")
                    link.users = link.playedUsers
                    link.playedUsers = []
                }
            }
            return PlayService.prototype.giveControl(link)
        }, 5000)
    }

    PlayService.prototype.begin = async function (interaction, link) {
        await MessageService.sendRegistration(interaction, link)
        pollForUser(link)
    };

    PlayService.prototype.giveControl = function (link) {
        if (link.users.length === 0) {
            if (link.playedUsers.length === 0) {
                if (link.currentUser != null) {
                    setTimeout(function() {
                        PlayService.prototype.giveControl(link)
                    }, link.controlTime)
                }
                link.isSearching = false
                return;
            } else {
                link.users = link.playedUsers
                link.playedUsers = []
                return PlayService.prototype.giveControl(link)
            }
        }
        link.isSearching = true
        // we have users
        const selectedUser = selectNewUser(link)
        pingUser(link, selectedUser)
    }

    function pingUser(link, selectedUser) {
        MessageService.pingUser(link, selectedUser).then((message) => {
            const collector = message.createMessageComponentCollector({max: 1, time: 10_000});

            collector.on('collect', async i => {
                if (i.customId === 'ping-yes') {
                    console.log('Giving control to ' + selectedUser.username)
                    i.reply('Thanks')
                    i.deleteReply()
                    if (link.currentControlMessage != null) {
                        link.currentControlMessage.delete()
                        link.currentControlMessage = null
                    }
                    if (link.currentUser != null) {
                        link.currentUser.send("Your time is up! Thanks for Playing!")
                        link.playedUsers.push(link.currentUser)
                    }
                    selectedUser.timeouts = 0
                    link.currentUser = selectedUser
                    removeUser(link, selectedUser)
                    PlayService.prototype.sendControls(link, selectedUser)
                    setTimeout(function() {
                        PlayService.prototype.giveControl(link)
                    }, link.controlTime)
                } else if (i.customId === 'ping-no') {
                    i.reply('You will be removed from the play queue')
                    removeUser(link, selectedUser)
                    PlayService.prototype.giveControl(link)
                }
            });
            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    if (selectedUser.timeouts == null) {
                        selectedUser.timeouts = 0
                    }
                    selectedUser.send("You missed your chance! Pay Attention!")
                    selectedUser.timeouts = selectedUser.timeouts + 1
                    if (selectedUser.timeouts >= 3) {
                        selectedUser.send("You walked away from this? To the Naughty List!")
                        console.log('Timing out ' + selectedUser.username + ' after 3 fails')
                        link.timeoutUsers.push(selectedUser)
                        removeUser(link, selectedUser)
                    }
                    PlayService.prototype.giveControl(link)
                }
                message.delete()
            });
        });
    }

    PlayService.prototype.sendControls = function (link, user) {
        MessageService.sendControls(link, user).then((message) => {
            const collector = message.createMessageComponentCollector();
            link.currentControlMessage = message
            collector.on('collect', async i => {
                let speed = link.speed
                if (i.customId === 'pass') {
                    link.timeoutUsers.push(link.currentUser)
                    link.currentControlMessage.delete()
                    link.currentControlMessage = null
                    link.currentUser = null
                    link.isSearching = false
                    i.reply('Control will be passed to the next user. Thanks for playing')
                } else {
                    i.deferUpdate();
                    if (i.customId === 'stop') {
                        speed = await SpeedService.stop(link)
                    } else if (i.customId === 'neg-two') {
                        speed = await SpeedService.speedDown(link, 2)
                    } else if (i.customId === 'neg-one') {
                        speed = await SpeedService.speedDown(link, 1)
                    } else if (i.customId === 'plus-one') {
                        speed = await SpeedService.speedUp(link, 1)
                    } else if (i.customId === 'plus-two') {
                        speed = await SpeedService.speedUp(link, 2)
                    } else if (i.customId === 'max') {
                        speed = await SpeedService.setSpeed(link, 20)
                    } else if (i.customId === 'one') {
                        speed = await SpeedService.setSpeed(link, 1)
                    } else if (i.customId === 'two') {
                        speed = await SpeedService.setSpeed(link, 2)
                    } else if (i.customId === 'three') {
                        speed = await SpeedService.setSpeed(link, 3)
                    } else if (i.customId === 'four') {
                        speed = await SpeedService.setSpeed(link, 4)
                    } else if (i.customId === 'five') {
                        speed = await SpeedService.setSpeed(link, 5)
                    } else if (i.customId === 'six') {
                        speed = await SpeedService.setSpeed(link, 6)
                    } else if (i.customId === 'seven') {
                        speed = await SpeedService.setSpeed(link, 7)
                    } else if (i.customId === 'eight') {
                        speed = await SpeedService.setSpeed(link, 8)
                    } else if (i.customId === 'nine') {
                        speed = await SpeedService.setSpeed(link, 9)
                    } else if (i.customId === 'ten') {
                        speed = await SpeedService.setSpeed(link, 10)
                    } else if (i.customId === 'eleven') {
                        speed = await SpeedService.setSpeed(link, 11)
                    } else if (i.customId === 'twelve') {
                        speed = await SpeedService.setSpeed(link, 12)
                    } else if (i.customId === 'thirteen') {
                        speed = await SpeedService.setSpeed(link, 13)
                    } else if (i.customId === 'fourteen') {
                        speed = await SpeedService.setSpeed(link, 14)
                    } else if (i.customId === 'fifteen') {
                        speed = await SpeedService.setSpeed(link, 15)
                    } else if (i.customId === 'sixteen') {
                        speed = await SpeedService.setSpeed(link, 16)
                    } else if (i.customId === 'seventeen') {
                        speed = await SpeedService.setSpeed(link, 17)
                    } else if (i.customId === 'eighteen') {
                        speed = await SpeedService.setSpeed(link, 18)
                    } else if (i.customId === 'nineteen') {
                        speed = await SpeedService.setSpeed(link, 19)
                    } else if (i.customId === 'twenty') {
                        speed = await SpeedService.setSpeed(link, 20)
                    }
                    message.embeds[0].fields[1].value = '' + speed
                    message.edit({embeds: [new MessageEmbed(message.embeds[0])]})
                }
            });
            return message;
        });
    }

    return {
        PlayService: new PlayService()
    }
}());

module.exports = PlayServiceModule;