import { stringToNumber } from 'app/utils/formatUtils';

describe('stringToNumber', () => {
    it('Konverterer helt tall', () => expect(stringToNumber('144')).toEqual(144));

    it('Konverterer desimaltall med komma', () => expect(stringToNumber('3,14')).toEqual(3.14));

    it('Konverterer desimaltall med punktum', () => expect(stringToNumber('3.14')).toEqual(3.14));

    it('Konverterer helt tall med tredjeordensseparatør', () => expect(stringToNumber('1 728')).toEqual(1728));

    it('Konverterer desimaltall med tredjeordensseparatør', () => expect(stringToNumber('1 728,08')).toEqual(1728.08));
});
