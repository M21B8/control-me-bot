const {MessageEmbed} = require('discord.js');
const {SpeedService} = require('../services/SpeedService.js');
const {MessageService} = require('../services/MessageService.js');
const Toys = require('../constants/Toys.js');
const Handler = require('../utils/HandlerUtils.js')

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


    PlayService.prototype.stopControl = async function (session, link, skipRequeue) {
        if (link.countdown != null) {
            clearTimeout(link.countdown)
        }
        if (link.currentControlMessage != null) {
            for (const property in link.currentControlMessage) {
                let x = link.currentControlMessage[property]
                if (x != null) {
                    await x.delete().catch(Handler.logError);
                }
            }
            link.currentControlMessage = null
        }
        if (link.currentUser != null) {
            link.currentUser.send("Your time is up! Thanks for Playing!").catch(Handler.logError);
            if (!skipRequeue) {
                session.playedUsers.push(link.currentUser)
            }
            link.currentUser = null
        }
    }
    PlayService.prototype.giveControl = function (session, link) {
        if (session.users.length === 0) {
            if (session.playedUsers.length === 0) {
                if (link.currentUser != null) {
                    if (link.controlTime > 0) {
                        link.countdown = setTimeout(function () {
                            console.log('Giving Control Again')
                            PlayService.prototype.giveControl(session, link)
                        }, link.controlTime)
                    }
                }
                link.isSearching = false
                return;
            } else {
                session.users = session.playedUsers
                session.playedUsers = []
            }
        }
        link.isSearching = true
        // we have users
        const selectedUser = selectNewUser(session)
        pingUser(session, link, selectedUser)
    }

    function pingUser(session, link, selectedUser) {
        MessageService.pingUser(link, selectedUser).then((message) => {
            const collector = message.createMessageComponentCollector({max: 1, time: 30_000});

            collector.on('collect', async i => {
                if (i.customId === 'ping-yes') {
                    if (session.users.some(user => user.id === selectedUser.id)) {
                        i.deferUpdate().catch(Handler.logError);
                        await PlayService.prototype.stopControl(session, link)
                        link.currentUser = selectedUser
                        console.log(selectedUser.username + " took control of " + link.startingUser.username)
                        selectedUser.timeouts = 0
                        removeUser(session, selectedUser)
                        PlayService.prototype.sendControls(session, link, selectedUser)
                        if (link.startTimestamp == null) {
                            link.startTimestamp = new Date()
                        }
                        if (link.controllers[selectedUser.id] == null) {
                            link.controllers[selectedUser.id] = 0
                        }
                        link.controllers[selectedUser.id] = link.controllers[selectedUser.id] + 1

                        if (link.controlTime > 0) {
                            link.countdown = setTimeout(function () {
                                console.log('Giving Control: Play Timeout')
                                PlayService.prototype.giveControl(session, link)
                            }, link.controlTime)
                        }
                        link.isSearching = false
                    } else {
                        i.reply('You seen to have left the game...').catch(Handler.logError);
                        console.log('Giving Control: Controller Not in game')
                        PlayService.prototype.giveControl(session, link)
                    }
                } else if (i.customId === 'ping-no') {
                    i.reply('You will be removed from the play queue').catch(Handler.logError);
                    removeUser(session, selectedUser)
                    console.log('Giving Control: Controller declined')
                    PlayService.prototype.giveControl(session, link)
                }
            });
            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    if (selectedUser.timeouts == null) {
                        selectedUser.timeouts = 0
                    }
                    selectedUser.timeouts = selectedUser.timeouts + 1
                    if (selectedUser.timeouts >= session.timeoutLimit) {
                        selectedUser.send("You missed your chance, you have been removed from the controller queue, please Sign Up again when you return").catch(Handler.logError);
                        console.log('Timing out ' + selectedUser.username + ' after ' + session.timeoutLimit + ' fail(s)')
                        session.timeoutUsers.push(selectedUser)
                        removeUser(session, selectedUser)
                    } else {
                        selectedUser.send("You missed your chance! Pay Attention!").catch(Handler.logError);
                    }
                    console.log('Giving Control: No Response')
                    PlayService.prototype.giveControl(session, link)
                }
                message.delete().catch(Handler.logError);
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
            i.deferUpdate().catch(Handler.logError);
            if (i.customId.endsWith('stop')) {
                await SpeedService.setSpeed(link, 0, isAlt)
            } else if (i.customId.endsWith('max')) {
                let speed = link.maxSpeed
                if (speed === -1) {
                    speed = 20
                }
                await SpeedService.setSpeed(link, speed, isAlt)
            } else {
                await setSpeed(link, i.customId, isAlt)
            }
            main.embeds[0].fields[1].value = '' + link.speed
            if (Toys[link.toys[0].name].hasAlternate) {
                main.embeds[0].fields[2].value = '' + link.altSpeed
            }
            main.edit({embeds: [new MessageEmbed(main.embeds[0])]}).catch(Handler.logError);
        });
    }

    async function endEarly(link, targetList) {
        targetList.push(link.currentUser)
        if (link.currentControlMessage !== null) {
            for (const property in link.currentControlMessage) {
                let x = link.currentControlMessage[property]
                if (x != null) {
                    await x.delete().catch(Handler.logError);
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
                    console.log(user.username + ' has left')
                    await endEarly(link, session.timeoutUsers)
                    i.reply('Control will be passed to the next user. You have been removed from the list of players. Thanks for playing.').catch(Handler.logError);
                } else if (i.customId === 'pass') {
                    console.log(user.username + ' has passed control')
                    await endEarly(link, session.playedUsers)
                    i.reply('Control will be passed to the next user. Thanks for playing.').catch(Handler.logError);
                } else {
                    console.log("WTF")
                    i.reply("WTF").catch(Handler.logError);
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