import { combineReducers } from 'redux';

import { Sakstype } from '../models/enums';
import { EksisterendeOMPKSSoknaderReducer } from '../omsorgspenger-kronisk-sykt-barn/state/reducers/EksisterendeOMPKSSoknaderReducer';
import { PunchOMPKSFormReducer } from '../omsorgspenger-kronisk-sykt-barn/state/reducers/PunchOMPKSFormReducer';
import { PunchOMPKSReducer } from '../omsorgspenger-kronisk-sykt-barn/state/reducers/PunchOMPKSReducer';
import { EksisterendeOMPMASoknaderReducer } from '../omsorgspenger-midlertidig-alene/state/reducers/EksisterendeOMPMASoknaderReducer';
import { PunchOMPMAFormReducer } from '../omsorgspenger-midlertidig-alene/state/reducers/PunchOMPMAFormReducer';
import { PunchOMPMAReducer } from '../omsorgspenger-midlertidig-alene/state/reducers/PunchOMPMAReducer';
import { EksisterendePLSSoknaderReducer } from '../pleiepenger-livets-sluttfase/state/reducers/EksisterendePLSSoknaderReducer';
import { PunchPLSFormReducer } from '../pleiepenger-livets-sluttfase/state/reducers/PunchPLSFormReducer';
import { PunchPLSReducer } from '../pleiepenger-livets-sluttfase/state/reducers/PunchPLSReducer';
import {
    AuthReducer,
    EksisterendeSoknaderReducer,
    FordelingReducer,
    FordelingSettPaaVentReducer,
    GosysOppgaveReducer,
    PunchFormReducer,
    PunchReducer,
    SignaturReducer,
} from './reducers';
import FellesReducer from './reducers/FellesReducer';
import { FordelingFerdigstillJournalpostReducer } from './reducers/FordelingFerdigstillJournalpostReducer';
import { IdentReducer } from './reducers/IdentReducer';
import { JournalposterPerIdentReducer } from './reducers/JournalposterPerIdentReducer';
import overføringPunchReducer from './reducers/omsorgspengeroverførdager/overføringPunchReducer';
import overføringSignaturReducer from './reducers/omsorgspengeroverførdager/overføringSignaturReducer';

export const rootReducer = combineReducers({
    [Sakstype.PLEIEPENGER_SYKT_BARN]: combineReducers({
        punchFormState: PunchFormReducer,
        punchState: PunchReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE]: combineReducers({
        punchFormState: PunchPLSFormReducer,
        punchState: PunchPLSReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.OMSORGSPENGER_KRONISK_SYKT_BARN]: combineReducers({
        punchFormState: PunchOMPKSFormReducer,
        punchState: PunchOMPKSReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.OMSORGSPENGER_MIDLERTIDIG_ALENE]: combineReducers({
        punchFormState: PunchOMPMAFormReducer,
        punchState: PunchOMPMAReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.OMSORGSPENGER_UTBETALING]: combineReducers({
        signaturState: SignaturReducer,
    }),
    [Sakstype.OMSORGSPENGER_OVERFØRING]: combineReducers({
        signatur: overføringSignaturReducer,
        punch: overføringPunchReducer,
    }),
    [Sakstype.OMSORGSPENGER_FORDELING]: combineReducers({
        opprettIGosys: GosysOppgaveReducer,
    }),
    fordelingState: FordelingReducer,
    authState: AuthReducer,
    felles: FellesReducer,
    journalposterPerIdentState: JournalposterPerIdentReducer,
    identState: IdentReducer,
    opprettIGosys: GosysOppgaveReducer,
    eksisterendeSoknaderState: EksisterendeSoknaderReducer,
    fordelingSettPåVentState: FordelingSettPaaVentReducer,
    fordelingFerdigstillJournalpostState: FordelingFerdigstillJournalpostReducer,
    eksisterendePLSSoknaderState: EksisterendePLSSoknaderReducer,
    eksisterendeOMPKSSoknaderState: EksisterendeOMPKSSoknaderReducer,
    eksisterendeOMPMASoknaderState: EksisterendeOMPMASoknaderReducer,
});

export type RootStateType = ReturnType<typeof rootReducer>;
