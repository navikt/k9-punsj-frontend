import DeleteButton         from 'app/components/delete-button/DeleteButton';
import FilledVersionBin1SVG from 'app/components/delete-button/FilledVersionBin1SVG';
import {shallow}            from 'enzyme';
import * as React           from 'react';

describe('DeleteButton', () => {

    it('Viser søppelkasseikon', () => {
        const deleteButton = shallow(<DeleteButton/>);
        expect(deleteButton.find(FilledVersionBin1SVG)).toHaveLength(1);
    });

    it('Har klassenavn "delete-button"', () => {
        const deleteButton = shallow(<DeleteButton/>);
        expect(deleteButton.prop('className')).toEqual('delete-button');
    });

    it('Har egendefinert klassenavn i tillegg til "delete-button"', () => {
        const className = 'egendefinertklasse';
        const deleteButton = shallow(<DeleteButton {...{className}}/>);
        expect(deleteButton.prop('className')).toContain('delete-button');
        expect(deleteButton.prop('className')).toContain(className);
    });
});
