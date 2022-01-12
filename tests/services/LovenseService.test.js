const fetch = require('node-fetch');
const {LovenseService} = require('../../services/LovenseService.js');
jest.mock('node-fetch', () => jest.fn())


describe('fetch-mock test', () => {
    it('can call the endpoint', async () => {
        const response = Promise.resolve({
            ok: true,
            json: () => {
                return {};
            },
        })

        fetch.mockImplementation(() => response)
        await response
        await LovenseService.call('abc', {});

        // can't figure this out for now
        expect(fetch).toHaveBeenCalledWith("https://c.lovense.com/app/ws/command/abc", expect.anything())
    });
});