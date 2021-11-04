import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import BinSvg from 'app/assets/SVG/BinSVG';
import DatoMedTimetall from 'app/models/types/DatoMedTimetall';
import PanelProps from 'app/models/types/korrigeringAvInntektsmelding/Paneler';
import intlHelper from 'app/utils/intlUtils';
import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { Input, SkjemaGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
import DateInput from '../../../components/skjema/DateInput';
import EkspanderbartPanel from './EkspanderbartPanel';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from './KorrigeringAvInntektsmeldingFormFieldsValues';
import './LeggTilDelvisFravær.less';

const LeggTilDelvisFravær: React.FC<PanelProps> = ({ isPanelOpen, togglePanel }): JSX.Element => {
    const intl = useIntl();
    const { values, setFieldValue } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();

    return (
        <>
            <EkspanderbartPanel
                label={intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.checkbox')}
                isPanelOpen={isPanelOpen}
                togglePanel={togglePanel}
            >
                <Panel className="listepanel delvisFravaer">
                    <FieldArray name={KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær}>
                        {({ push, remove }) => (
                            <>
                                <SkjemaGruppe
                                    legend={
                                        <h4 className="korrigering-legend">
                                            {intlHelper(
                                                intl,
                                                'omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.legend'
                                            )}
                                        </h4>
                                    }
                                >
                                    <AlertStripeInfo>
                                        {intlHelper(
                                            intl,
                                            'omsorgspenger.korrigeringAvInntektsmelding.leggTilDelvisFravær.info'
                                        )}
                                    </AlertStripeInfo>
                                    <Panel className="delvisFravaer__inputContainer">
                                        {values[KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]?.map(
                                            (value: DatoMedTimetall, index: number) => {
                                                const fieldName = `${KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær}.${index}`;
                                                return (
                                                    <Row noGutters key={fieldName}>
                                                        <div className="delvisFravaer__inputfelter">
                                                            <Field name={`${fieldName}.dato`}>
                                                                {({ field }: FieldProps) => (
                                                                    <DateInput
                                                                        value={field.value}
                                                                        onChange={(dato) => {
                                                                            setFieldValue(field.name, dato);
                                                                        }}
                                                                        className="dateInput"
                                                                        label={intlHelper(intl, 'skjema.dato')}
                                                                    />
                                                                )}
                                                            </Field>
                                                            <Field name={`${fieldName}.timer`}>
                                                                {({ field }: FieldProps) => (
                                                                    <Input
                                                                        {...field}
                                                                        label={intlHelper(
                                                                            intl,
                                                                            'skjema.perioder.timer'
                                                                        )}
                                                                        bredde="XS"
                                                                    />
                                                                )}
                                                            </Field>
                                                            <button
                                                                id="slett"
                                                                className="fjern"
                                                                type="button"
                                                                onClick={() => {
                                                                    remove(index);
                                                                }}
                                                            >
                                                                <div className="slettIcon">
                                                                    <BinSvg title="fjern" />
                                                                </div>
                                                                {intlHelper(intl, 'skjema.liste.fjern_dag')}
                                                            </button>
                                                        </div>
                                                    </Row>
                                                );
                                            }
                                        )}
                                    </Panel>
                                </SkjemaGruppe>
                                <Row noGutters>
                                    <button
                                        id="leggTilDag"
                                        className="leggtilperiode"
                                        type="button"
                                        onClick={() => {
                                            push({ dato: '', timer: '' });
                                        }}
                                    >
                                        <div className="leggtilperiodeIcon">
                                            <AddCircleSvg title="leggtil" />
                                        </div>
                                        {intlHelper(intl, 'skjema.dag.legg_til')}
                                    </button>
                                </Row>
                            </>
                        )}
                    </FieldArray>
                </Panel>
            </EkspanderbartPanel>
        </>
    );
};

export default LeggTilDelvisFravær;
