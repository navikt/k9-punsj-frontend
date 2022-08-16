// eslint-disable-next-line import/no-extraneous-dependencies
import { ComponentStory } from '@storybook/react';
import React from 'react';
import TidsbrukKalender from '../TidsbrukKalender';

export default {
    component: TidsbrukKalender,
};

const Template: ComponentStory<typeof TidsbrukKalender> = (args) => <TidsbrukKalender {...args} />;

export const multiSelect = Template.bind({});

multiSelect.args = {
    periode: { fom: new Date('2022-08-01'), tom: new Date('2022-08-30') },
};
