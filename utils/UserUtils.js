module.exports = {
    isUserRegistered: function (session, searchUser) {
        let userRegistered = false;
        if (!userRegistered && session.users.some(user => user.id === searchUser.id)) {
            userRegistered = true;
        }
        if (!userRegistered && session.playedUsers.some(user => user.id === searchUser.id)) {
            userRegistered = true;
        }
        if (!userRegistered && Object.values(session.links).some(link => link.currentUser != null && link.currentUser.id === searchUser.id)) {
            userRegistered = true
        }

        return userRegistered;
    },

    findUserToyLinks: function (session, searchUser) {
        return Object.values(session.links).filter(link => link.startingUser.id === searchUser.id)
    },

    findUserControlLinks: function (session, searchUser) {
        return Object.values(session.links).filter(link => link.currentUser != null && link.currentUser.id === searchUser.id)
    }
}