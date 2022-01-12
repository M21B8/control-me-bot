const {LovenseService} = require('../../services/LovenseService.js');
const {SpeedService} = require('../../services/SpeedService.js');
jest.mock('../../services/LovenseService.js')


describe('Speed Service test', () => {

    const mockMaxLink = {
        id: 'abc',
        toys: [
            {id: '123', name: 'max'}
        ],
        speed: 10,
        altSpeed: 10,

    }

    it('can set a main speed', async () => {
        const response = Promise.resolve({})

        await response
        let result = await SpeedService.setSpeed(mockMaxLink, 11);
        expect(result).toBe(11);
        let mockCall = LovenseService.call.mock.calls.length - 1
        expect(LovenseService.call.mock.calls[mockCall][0]).toBe('abc')
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']).not.toBeNull()
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['v']).toBe(11)
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['v1']).toBe(-1)
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['v2']).toBe(-1)
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['p']).toBe(mockMaxLink.altSpeed)
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['r']).toBe(-1)
    });

    it('can set an alternate speed', async () => {
        const response = Promise.resolve({})

        await response
        let result = await SpeedService.setSpeed(mockMaxLink, 11, true);
        expect(result).toBe(11);

        let mockCall = LovenseService.call.mock.calls.length - 1
        expect(LovenseService.call.mock.calls[mockCall][0]).toBe('abc')
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']).not.toBeNull()
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['v']).toBe(mockMaxLink.speed)
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['v1']).toBe(-1)
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['v2']).toBe(-1)
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['p']).toBe(11)
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['r']).toBe(-1)
    });

    it('can set speed for an Edge', async () => {
        const mockEdgeLink = {
            id: 'abc',
            toys: [
                {id: '123', name: 'edge'}
            ],
            speed: 10,
            altSpeed: 10,

        }

        const response = Promise.resolve({})

        await response
        let result = await SpeedService.setSpeed(mockEdgeLink, 11, true);
        expect(result).toBe(11);

        let mockCall = LovenseService.call.mock.calls.length - 1
        expect(LovenseService.call.mock.calls[mockCall][0]).toBe('abc')
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']).not.toBeNull()
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['v']).toBe(-1)
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['v1']).toBe(11)
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['v2']).toBe(mockEdgeLink.altSpeed)
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['p']).toBe(-1)
        expect(LovenseService.call.mock.calls[mockCall][1].id['123']['r']).toBe(-1)
    });
});