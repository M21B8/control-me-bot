function findSessionForUser(userId) {
    return Object.values(sessions).find((session) => {
        return Object.values(session.links).some((link) => {
            return link.startingUser.id === userId;
        });
    });
}

let sessions = {
    '123': {
        links: {
            '234': { user: {id: 'a'}},
            '235': { user: {id: 'b'}},
            '236': { user: {id: 'c'}},
            '237': { user: {id: 'd'}},
        }
    },
    '124': {
        links: {
            '334': { user: {id: 'e'}},
            '335': { user: {id: 'f'}},
            '336': { user: {id: 'g'}},
            '337': { user: {id: 'h'}},
        }
    }
}

findSessionForUser('f')