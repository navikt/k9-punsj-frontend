import DeleteButton         from 'app/components/delete-button/DeleteButton';
import FilledVersionBin1SVG from 'app/components/delete-button/FilledVersionBin1SVG';
import {configure, shallow} from 'enzyme';
import Adapter              from 'enzyme-adapter-react-16';
import * as React           from 'react';

configure({adapter: new Adapter()});

test('Slettknapp inneholder søppelkasseikon', () => {
    const deleteButton = shallow(<DeleteButton/>);
    expect(deleteButton.find(FilledVersionBin1SVG)).toHaveLength(1);
});