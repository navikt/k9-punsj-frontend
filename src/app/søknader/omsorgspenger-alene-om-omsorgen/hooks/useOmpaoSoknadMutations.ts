import { useCallback, useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { useFormContext } from 'react-hook-form';
import { Feil, ValideringResponse } from 'app/models/types/ValideringResponse';
import { useOppdaterSoeknadMutation, useSendSoeknadMutation, useValiderSoeknadMutation } from '../api';
import { IOMPAOSoknad } from '../types/OMPAOSoknad';
import { IOMPAOSoknadKvittering } from '../types/OMPAOSoknadKvittering';

export const flattenErrors = (errors: object) => {
    const errorMessages: { key: string; message: string }[] = [];
    const recurse = (obj: any, path: string) => {
        if (!obj) return;
        if (typeof obj.message === 'string') {
            errorMessages.push({ key: path, message: obj.message });
        } else {
            Object.keys(obj).forEach((key) => {
                const newPath = path ? `${path}.${key}` : key;
                recurse(obj[key], newPath);
            });
        }
    };
    recurse(errors, '');
    return errorMessages;
};

interface UseOmpaoSoknadMutationsProps {
    onSoknadSent: (kvittering: IOMPAOSoknadKvittering) => void;
    onSoknadSendError: (error: Error) => void;
    onSoknadUpdated: () => void;
}

export const useOmpaoSoknadMutations = ({
    onSoknadSent,
    onSoknadSendError,
    onSoknadUpdated,
}: UseOmpaoSoknadMutationsProps) => {
    const { watch, getValues } = useFormContext<IOMPAOSoknad>();

    const [k9FormatErrors, setK9FormatErrors] = useState<Feil[]>([]);
    const [visForhaandsvisModal, setVisForhaandsvisModal] = useState(false);
    const [kvittering, setKvittering] = useState<IOMPAOSoknadKvittering | undefined>(undefined);
    const [harForsoektAaSendeInn, setHarForsoektAaSendeInn] = useState(false);

    const { mutate: valider } = useValiderSoeknadMutation({
        setKvittering,
        setK9FormatErrors,
        setVisForhaandsvisModal,
    });

    const { mutate: sendSoeknadMutate, error: submitError } = useSendSoeknadMutation(
        (data: IOMPAOSoknadKvittering | ValideringResponse) => {
            if ('søknadId' in data) {
                onSoknadSent(data as IOMPAOSoknadKvittering);
            }
        },
        (error: Error) => {
            onSoknadSendError(error);
        },
    );

    const {
        isPending: mellomlagrer,
        error: mellomlagringError,
        mutate: mellomlagreSoeknad,
    } = useOppdaterSoeknadMutation({
        onSuccess: (data: any, { submitSoknad }: { soeknad: Partial<IOMPAOSoknad>; submitSoknad: boolean }) => {
            onSoknadUpdated();
            if (submitSoknad) {
                const valuesAfterUpdate = getValues();
                sendSoeknadMutate({
                    soeknadId: valuesAfterUpdate.soeknadId,
                    ident: valuesAfterUpdate.soekerId,
                });
            }
        },
    });

    const debounceCallback = useCallback(
        debounce((values: IOMPAOSoknad, harForsoekt: boolean) => {
            if (harForsoekt) {
                valider({
                    soeknad: values,
                    skalForhaandsviseSoeknad: false,
                    isValid: false,
                });
            }
            mellomlagreSoeknad({ soeknad: values, submitSoknad: false });
        }, 1000),
        [valider, mellomlagreSoeknad],
    );

    useEffect(() => {
        const subscription = watch((values, { type }) => {
            if (type) {
                debounceCallback(values as IOMPAOSoknad, harForsoektAaSendeInn);
            }
        });

        return () => {
            subscription.unsubscribe();
            debounceCallback.cancel();
        };
    }, [watch, debounceCallback, harForsoektAaSendeInn]);

    const submit = () => {
        if (!harForsoektAaSendeInn) {
            setHarForsoektAaSendeInn(true);
        }
        valider({ soeknad: getValues(), skalForhaandsviseSoeknad: true, isValid: true });
    };

    const confirmAndSend = () => {
        const currentValues = getValues();
        if (harForsoektAaSendeInn) {
            valider({
                soeknad: currentValues,
                skalForhaandsviseSoeknad: false,
                isValid: false,
            });
        }
        mellomlagreSoeknad({
            soeknad: currentValues,
            submitSoknad: true,
        });
    };

    return {
        mellomlagrer,
        mellomlagringError,
        submitError,
        k9FormatErrors,
        visForhaandsvisModal,
        setVisForhaandsvisModal,
        kvittering,
        submit,
        confirmAndSend,
    };
};
