const {SessionService} = require('../../services/SessionService.js');

let session1 = SessionService.createSession();
let session2 = SessionService.createSession();
let session3 = SessionService.createSession();

describe('Session Service tests', () => {
    test('can create a session with default play time', () => {
        expect(session1.id).not.toBeNull();
        expect(session1.links).not.toBeNull();
        expect(session1.users).not.toBeNull();
        expect(session1.playedUsers).not.toBeNull();
        expect(session1.timeoutUsers).not.toBeNull();
        expect(session1.sessionPlaytime).toBe(60_000);

        session1.channelId = 123
    });

    test('can create a session with set play time', () => {
        const session = SessionService.createSession(12345);
        expect(session.sessionPlaytime).toBe(12345);
    });

    test('can get a session', () => {
        const retrieved = SessionService.getSession(session1.id, 123)
        expect(retrieved).toBe(session1)
    })

    test('can get a session by channel id', () => {
        const retrieved = SessionService.getSession(null, 123)
        expect(retrieved).toBe(session1)
    })

    test('can get a session by channel id that doesnt exist', () => {
        const retrieved = SessionService.getSession(null, 124)
        expect(retrieved).toBe(null)
    })

    test('can get a session by channel id that doesnt exist', () => {
        session2.channelId = 125
        session3.channelId = 125
        const retrieved = SessionService.getSession(null, 125)
        expect(retrieved).toBe(null)
    })

    test('can find a session for a starting user', () => {
        session1.links['abc'] = {
            startingUser: {id: 'def'}
        }

        const found = SessionService.findSessionForUser('def')
        expect(found).toBe(session1)
    })

    test('can end a session', () => {
        session1.startMessage = {
            delete: jest.fn(() => {
                return {
                    catch: jest.fn(() => {
                    })
                };
            })
        }
        SessionService.endSession(session1)
        expect(session1.startMessage.delete.mock.calls.length).toBe(1)
    })

    test('can end a session without a message', () => {
        SessionService.endSession(session2)
        expect(session1.startMessage.delete.mock.calls.length).toBe(1)
    })
});