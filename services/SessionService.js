const crypto = require("crypto");
const Handler = require('../utils/HandlerUtils.js');


const SessionServiceModule = (function () {
    /**
     * Constructor initialize object
     * @constructor
     */
    const SessionService = function () {
        this.sessions = {};
    };


    SessionService.prototype.createSession = function (playtime = 60_000) {
        const id = crypto.randomBytes(3).toString("hex");
        const session = {
            id: id,
            links: {},
            users: [],
            timeoutUsers: [],
            playedUsers: [],
            sessionPlaytime: playtime
        };
        this.sessions[id] = session;
        return session;
    }

    SessionService.prototype.endSession = function (session) {
        if (session.startMessage != null) {
            session.startMessage.delete().catch(Handler.logError)
        }
        delete this.sessions[session.id]
    }

    SessionService.prototype.getSession = function (id, channelId) {
        let session = null
        if (id != null) {
            session = this.sessions[id]
        } else {
            const channelSessions = Object.values(this.sessions)
                .filter(session => session.channelId === channelId);
            if (channelSessions.length === 1) {
                session = channelSessions[0]
            } else if (channelSessions.length > 1) {
                console.log("Too many sessions")
            } else {
                console.log("No Session found")
            }
        }
        return session
    }

    SessionService.prototype.findSessionForUser = function (userId) {
        return Object.values(this.sessions).find((session) => {
            return Object.values(session.links).some((link) => {
                return link.startingUser.id === userId;
            });
        });
    }

    return {
        SessionService: new SessionService()
    }
}());

module.exports = SessionServiceModule;