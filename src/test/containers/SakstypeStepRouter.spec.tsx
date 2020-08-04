import {shallow}          from 'enzyme';
import React              from 'react';
import SakstypeStepRouter from '../../app/containers/SakstypeStepRouter';
import {Sakstype}         from '../../app/models/enums';

jest.mock('app/hooks/useRedirect');

describe('SakstypeStepRouter', () => {
    it('lager routes for hvert step i en sakstype konfig', () => {
        const sakstypePath = '/sakstypePath';
        const steps = [
            {
                stepName: 'teststep',
                stepOrder: 0,
                path: '/path1',
                getComponent: () => 'heihei'
            },
            {
                stepName: 'teststep2',
                stepOrder: 1,
                path: '/path2',
                getComponent: () => 'hallo2'
            }
        ];

        const wrapper = shallow(
            <SakstypeStepRouter journalpostid="200" sakstypeConfig={{
                punchPath: sakstypePath,
                navn: Sakstype.OMSORGSPENGER,
                steps
            }} />
        );

        const routes = wrapper.find('Route');

        expect(routes).toHaveLength(steps.length);

        steps.forEach(step => {
            const route = routes.get(step.stepOrder);

            expect(route.props.children).toEqual(step.getComponent());
            expect(route.props.path).toEqual(`${sakstypePath}${step.path}`)
        });
    });
});
