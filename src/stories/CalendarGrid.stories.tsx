// eslint-disable-next-line
import { ComponentStory } from '@storybook/react';
import React from 'react';

import CalendarGrid from '../app/components/calendar/CalendarGrid';

export default {
    component: CalendarGrid,
};

const Template: ComponentStory<typeof CalendarGrid> = (args) => <CalendarGrid {...args} />;

export const enMåned = Template.bind({});

enMåned.args = {
    month: { fom: new Date('2022-08-01'), tom: new Date('2022-08-30') },
    dateContentRenderer: () => 'test',
    onDateClick: () => console.error('gi meg en modal'),
};
