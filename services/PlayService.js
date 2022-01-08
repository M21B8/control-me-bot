const {MessageEmbed} = require('discord.js');
const {SpeedService} = require('../services/SpeedService.js');
const {SoloMessageService} = require('../services/SoloMessageService.js');
const {MessageService} = require('../services/MessageService.js');
const Toys = require('../constants/Toys.js');

const PlayServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const PlayService = function () {
    };

    function selectNewUser(session) {
        let userIndex = Math.floor((Math.random() * session.users.length) + 1) - 1;
        return session.users[userIndex]
    }

    function removeUser(session, user) {
        session.users = session.users.filter((item) => {
            return item !== user
        })
    }

    function pollForUser(session, link) {
        setInterval(function () {
            if (link.currentUser != null || link.isSearching) {
                return
            }
            if (session.users.length === 0) {
                if (session.playedUsers.length !== 0) {
                    console.log("recycling played users")
                    session.users = session.playedUsers
                    session.playedUsers = []
                }
            }
            return PlayService.prototype.giveControl(session, link)
        }, 5000)
    }

    PlayService.prototype.begin = async function (interaction, session, link) {
        await SoloMessageService.sendRegistration(interaction, session, link)
        pollForUser(session, link)
    };
    PlayService.prototype.stopControl = async function (session, link) {
        if (link.countdown != null) {
            clearTimeout(link.countdown)
        }
        if (link.currentControlMessage != null) {
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
            session.playedUsers.push(link.currentUser)
            link.currentUser = null
        }
    }
    PlayService.prototype.giveControl = function (session, link) {
        if (session.users.length === 0) {
            if (session.playedUsers.length === 0) {
                if (link.currentUser != null) {
                    if (link.controlTime > 0) {
                        link.countdown = setTimeout(function () {
                            PlayService.prototype.giveControl(session, link)
                        }, link.controlTime)
                    }
                }
                link.isSearching = false
                return;
            } else {
                session.users = session.playedUsers
                session.playedUsers = []
                return PlayService.prototype.giveControl(session, link)
            }
        }
        link.isSearching = true
        // we have users
        const selectedUser = selectNewUser(session)
        pingUser(session, link, selectedUser)
    }

    function pingUser(session, link, selectedUser) {
        MessageService.pingUser(link, selectedUser).then((message) => {
            const collector = message.createMessageComponentCollector({max: 1, time: 10_000});

            collector.on('collect', async i => {
                if (i.customId === 'ping-yes') {
                    link.isSearching = false
                    console.log(selectedUser.username + " took control of " + link.startingUser.username)
                    i.deferUpdate().catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                    await PlayService.prototype.stopControl(session, link)
                    selectedUser.timeouts = 0
                    link.currentUser = selectedUser
                    removeUser(session, selectedUser)
                    PlayService.prototype.sendControls(session, link, selectedUser)
                    if (link.controlTime > 0) {
                        link.countdown = setTimeout(function () {
                            PlayService.prototype.giveControl(session, link)
                        }, link.controlTime)
                    }
                } else if (i.customId === 'ping-no') {
                    i.reply('You will be removed from the play queue').catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                    removeUser(session, selectedUser)
                    PlayService.prototype.giveControl(session, link)
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
                        session.timeoutUsers.push(selectedUser)
                        removeUser(session, selectedUser)
                    }
                    PlayService.prototype.giveControl(session, link)
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
            console.log(main.embeds[0].fields)
            main.embeds[0].fields[1].value = '' + link.speed
            if (Toys[link.toys[0].name].hasAlternate) {
                main.embeds[0].fields[2].value = '' + link.altSpeed
                main.embeds[0].fields[3].value = '' + link.timeLeft
            } else {
                main.embeds[0].fields[2].value = '' + link.timeLeft
            }
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

    PlayService.prototype.sendControls = function (session, link, user) {
        MessageService.sendControls(link, user).then((message) => {

            link.currentControlMessage = message
            const main = message[0]

            const mainCollector = main.createMessageComponentCollector();
            mainCollector.on('collect', async i => {
                if (i.customId === 'leave') {
                    console.log(link.currentUser.username + ' has left')
                    await endEarly(link, session.timeoutUsers)
                    i.reply('Control will be passed to the next user. You have been removed from the list of players. Thanks for playing.').catch(e => {
                        console.log("Failed to send response")
                        console.log(e)
                    });
                } else if (i.customId === 'pass') {
                    console.log(link.currentUser.username + ' has passed control')
                    await endEarly(link, session.playedUsers)
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