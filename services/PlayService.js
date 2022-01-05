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
                    setTimeout(function () {
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
                    i.deferUpdate().catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                    if (link.currentControlMessage !== null) {
                        for (const property in link.currentControlMessage) {
                            let x = link.currentControlMessage[property]
                            if (x != null) {
                                await x.delete().catch(e => {
                                    console.log("Failed to send response")
                                    console.log(e)
                                });
                            }
                        }
                        link.currentControlMessage = null
                    }
                    if (link.currentUser != null) {
                        link.currentUser.send("Your time is up! Thanks for Playing!").catch(e => {
                            console.log("Failed to send response")
                            console.log(e)
                        });
                        link.playedUsers.push(link.currentUser)
                    }
                    selectedUser.timeouts = 0
                    link.currentUser = selectedUser
                    removeUser(link, selectedUser)
                    PlayService.prototype.sendControls(link, selectedUser)
                    setTimeout(function () {
                        PlayService.prototype.giveControl(link)
                    }, link.controlTime)
                } else if (i.customId === 'ping-no') {
                    i.reply('You will be removed from the play queue').catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                    removeUser(link, selectedUser)
                    PlayService.prototype.giveControl(link)
                }
            });
            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    if (selectedUser.timeouts == null) {
                        selectedUser.timeouts = 0
                    }
                    selectedUser.send("You missed your chance! Pay Attention!").catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                    selectedUser.timeouts = selectedUser.timeouts + 1
                    if (selectedUser.timeouts >= 3) {
                        selectedUser.send("You walked away from this? To the Naughty List!").catch(e => {
                            console.log("Failed to send response")
                            console.log(e)
                        });
                        console.log('Timing out ' + selectedUser.username + ' after 3 fails')
                        link.timeoutUsers.push(selectedUser)
                        removeUser(link, selectedUser)
                    }
                    PlayService.prototype.giveControl(link)
                }
                message.delete().catch(e => {
                    console.log("Failed to send response")
                    console.log(e)
                });
            });
        });
    }
    const idToSpeed = {
        "one": 1,
        "two": 2,
        "three": 3,
        "four": 4,
        "five": 5,
        "six": 6,
        "seven": 7,
        "eight": 8,
        "nine": 9,
        "ten": 10,
        "eleven": 11,
        "twelve": 12,
        "thirteen": 13,
        "fourteen": 14,
        "fifteen": 15,
        "sixteen": 16,
        "seventeen": 17,
        "eighteen": 18,
        "nineteen": 19,
        "twenty": 20,
    }
    async function setSpeed(link, id, isAlt) {
        let parsed = id
        if (isAlt) {
            parsed = id.substr(4)
        }
        return SpeedService.setSpeed(link, idToSpeed[parsed], isAlt)
    }

    function handleSpeeds(link, message, main) {
        const messageCollector = message.createMessageComponentCollector();
        messageCollector.on('collect', async i => {
            const isAlt = i.customId.startsWith("alt-")
            i.deferUpdate().catch(e => {
                console.log("Failed to send response")
                console.log(e)
            });
            if (i.customId.endsWith('stop')) {
                await SpeedService.setSpeed(link, 0, isAlt)
            } else if (i.customId.endsWith('max')) {
                await SpeedService.setSpeed(link, 20, isAlt)
            } else {
                await setSpeed(link, i.customId, isAlt)
            }
            main.embeds[0].fields[1].value = '' + link.speed
            main.embeds[0].fields[2].value = '' + link.altSpeed
            main.edit({embeds: [new MessageEmbed(main.embeds[0])]})
        });
    }

    async function endEarly(link, targetList) {
        targetList.push(link.currentUser)
        if (link.currentControlMessage !== null) {
            for (const property in link.currentControlMessage) {
                let x = link.currentControlMessage[property]
                if (x != null) {
                    await x.delete().catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                }
            }
            link.currentControlMessage = null
        }
        link.currentUser = null
        link.isSearching = false
    }

    PlayService.prototype.sendControls = function (link, user) {
        MessageService.sendControls(link, user).then((message) => {

            link.currentControlMessage = message
            const main = message[0]

            const mainCollector = main.createMessageComponentCollector();
            mainCollector.on('collect', async i => {
                if (i.customId === 'leave') {
                    console.log(link.currentUser.username + ' has left')
                    await endEarly(link, link.timeoutUsers)
                    i.reply('Control will be passed to the next user. You have been removed from the list of players. Thanks for playing.').catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                } else if (i.customId === 'pass') {
                    console.log(link.currentUser.username + ' has passed control')
                    await endEarly(link, link.playedUsers)
                    i.reply('Control will be passed to the next user. Thanks for playing.').catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                } else {
                    console.log("WTF")
                    i.reply("WTF").catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                }
            });

            const primary = message[1]
            handleSpeeds(link, primary, main)

            const alt = message[2]
            if (alt != null) {
                handleSpeeds(link, alt, main)
            }

        });
    }

    return {
        PlayService: new PlayService()
    }
}());

module.exports = PlayServiceModule;