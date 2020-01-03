import {IPath}   from 'app/models/types';
import {getPath} from 'app/utils/pathUtils';

describe('pathUtils', () => {

    const paths: IPath[] = [
        {step: 0, path: '/test/{id1}?id2={id2}'},
        {step: 1, path: '/test'}
    ];

    it('Skal formatere en sti med parametre', () => {
        const id1 = '321';
        const id2 = 'abc';
        const result = getPath(paths, 0, {id1, id2});
        expect(result).toEqual(`/test/${id1}?id2=${id2}`);
    });

    it('Skal formatere en sti med parameternavn når verdier ikke er satt', () => {
        const result = getPath(paths, 0);
        expect(result).toEqual(`/test/:id1?id2=:id2`);
    });

    it('Skal formatere en sti uten parameternavn', () => {
        const result = getPath(paths, 1);
        expect(result).toEqual('/test');
    });
});