import { prettifyDateString } from '../../app/utils/date/dateFormat';

describe('Format tests', () => {
    it('should prettify date', () => {
        expect(prettifyDateString('2021-04-30')).toBe('30.04.2021');
    });
});
