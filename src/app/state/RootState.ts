import { combineReducers } from 'redux';

import { Sakstype } from '../models/enums';
import { EksisterendeOMPKSSoknaderReducer } from '../omsorgspenger-kronisk-sykt-barn/state/reducers/EksisterendeOMPKSSoknaderReducer';
import { PunchOMPKSFormReducer } from '../omsorgspenger-kronisk-sykt-barn/state/reducers/PunchOMPKSFormReducer';
import { EksisterendeOMPMASoknaderReducer } from '../omsorgspenger-midlertidig-alene/state/reducers/EksisterendeOMPMASoknaderReducer';
import { PunchOMPMAFormReducer } from '../omsorgspenger-midlertidig-alene/state/reducers/PunchOMPMAFormReducer';
import { EksisterendePLSSoknaderReducer } from '../pleiepenger-livets-sluttfase/state/reducers/EksisterendePLSSoknaderReducer';
import { PunchPLSFormReducer } from '../pleiepenger-livets-sluttfase/state/reducers/PunchPLSFormReducer';
import {
    AuthReducer,
    EksisterendeSoknaderReducer,
    FordelingReducer,
    FordelingSettPaaVentReducer,
    GosysOppgaveReducer,
    PunchFormReducer,
    SignaturReducer,
} from './reducers';
import FellesReducer from './reducers/FellesReducer';
import { FordelingFerdigstillJournalpostReducer } from './reducers/FordelingFerdigstillJournalpostReducer';
import { IdentReducer } from './reducers/IdentReducer';
import { JournalposterPerIdentReducer } from './reducers/JournalposterPerIdentReducer';

export const rootReducer = combineReducers({
    [Sakstype.PLEIEPENGER_SYKT_BARN]: combineReducers({
        punchFormState: PunchFormReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE]: combineReducers({
        punchFormState: PunchPLSFormReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.OMSORGSPENGER_KRONISK_SYKT_BARN]: combineReducers({
        punchFormState: PunchOMPKSFormReducer,
        signaturState: SignaturReducer,
    }),
    // trenger ikke være global
    [Sakstype.OMSORGSPENGER_MIDLERTIDIG_ALENE]: combineReducers({
        punchFormState: PunchOMPMAFormReducer,
        signaturState: SignaturReducer,
    }),
    // trenger ikke være global
    [Sakstype.OMSORGSPENGER_UTBETALING]: combineReducers({
        signaturState: SignaturReducer,
    }),
    // trenger ikke være global
    [Sakstype.OMSORGSPENGER_FORDELING]: combineReducers({
        opprettIGosys: GosysOppgaveReducer,
    }),
    fordelingState: FordelingReducer, // trenger ikke være global
    authState: AuthReducer,
    felles: FellesReducer,
    journalposterPerIdentState: JournalposterPerIdentReducer,
    identState: IdentReducer,
    opprettIGosys: GosysOppgaveReducer, // trenger ikke være global
    eksisterendeSoknaderState: EksisterendeSoknaderReducer,
    fordelingSettPåVentState: FordelingSettPaaVentReducer, // trenger ikke være global
    fordelingFerdigstillJournalpostState: FordelingFerdigstillJournalpostReducer, // trenger ikke være global
    eksisterendePLSSoknaderState: EksisterendePLSSoknaderReducer, // trenger ikke være global
    eksisterendeOMPKSSoknaderState: EksisterendeOMPKSSoknaderReducer, // trenger ikke være global
    eksisterendeOMPMASoknaderState: EksisterendeOMPMASoknaderReducer, // trenger ikke være global
});

export type RootStateType = ReturnType<typeof rootReducer>;
