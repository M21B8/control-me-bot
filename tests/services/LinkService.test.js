const fetch = require('node-fetch');
const {LinkService} = require('../../services/LinkService.js');
jest.mock('node-fetch', ()=>jest.fn())


describe('Session Service tests', () => {
    test('can ping an id', async function() {
        const response = Promise.resolve({
            ok: true,
            json: () => {
                return {};
            },
        })

        fetch.mockImplementation(() => response)
        await response
        await LinkService.ping('abc');

        // can't figure this out for now
        expect(fetch).toHaveBeenCalledWith("https://c.lovense.com/app/ws/loading/abc", expect.anything())

    });

});