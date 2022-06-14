import React from 'react';
import { CheckboxGroup as NavCheckboxGroup, CheckboxGroupProps } from '@navikt/ds-react';

type OwnProps = CheckboxGroupProps

const CheckboxGroup = ({ name, children }: OwnProps) => <CheckboxGroup>{children}</CheckboxGroup>;
