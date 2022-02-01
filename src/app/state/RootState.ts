import {combineReducers} from 'redux';
import {
    AuthReducer,
    FordelingReducer,
    GosysOppgaveReducer,
    EksisterendeSoknaderReducer,
    SoknaderSokReducer,
    PunchFormReducer,
    PunchReducer,
    SignaturReducer,
    FordelingSettPaaVentReducer,
} from './reducers';
import FellesReducer from './reducers/FellesReducer';
import {Sakstype} from '../models/enums';
import overføringSignaturReducer from './reducers/omsorgspengeroverførdager/overføringSignaturReducer';
import overføringPunchReducer from './reducers/omsorgspengeroverførdager/overføringPunchReducer';
import {SoknaderVisningReducer} from './reducers/SoknaderVisningReducer';
import {JournalposterPerIdentReducer} from './reducers/JournalposterPerIdentReducer';
import {IdentReducer} from './reducers/IdentReducer';
import {PunchOMPKSFormReducer} from '../omsorgspenger-kronisk-sykt-barn/state/reducers/PunchOMPKSFormReducer'
import {
    EksisterendeOMPKSSoknaderReducer
} from '../omsorgspenger-kronisk-sykt-barn/state/reducers/EksisterendeOMPKSSoknaderReducer';
import {PunchOMPKSReducer} from '../omsorgspenger-kronisk-sykt-barn/state/reducers/PunchOMPKSReducer';
import { FordelingFerdigstillJournalpostReducer } from './reducers/FordelingFerdigstillJournalpostReducer';

export const rootReducer = combineReducers({
    [Sakstype.PLEIEPENGER_SYKT_BARN]: combineReducers({
        punchFormState: PunchFormReducer,
        punchState: PunchReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.OMSORGSPENGER_KRONISK_SYKT_BARN]: combineReducers({
        punchFormState: PunchOMPKSFormReducer,
        punchState: PunchOMPKSReducer,
        signaturState: SignaturReducer,
    }),
    [Sakstype.OMSORGSPENGER_OVERFØRING]: combineReducers({
        signatur: overføringSignaturReducer,
        punch: overføringPunchReducer,
    }),
    [Sakstype.OMSORGSPENGER_FORDELING]: combineReducers({
        opprettIGosys: GosysOppgaveReducer,
    }),
    SØK: combineReducers({
        soknaderSokState: SoknaderSokReducer,
        visningState: SoknaderVisningReducer,
    }),
    fordelingState: FordelingReducer,
    authState: AuthReducer,
    felles: FellesReducer,
    journalposterPerIdentState: JournalposterPerIdentReducer,
    identState: IdentReducer,
    opprettIGosys: GosysOppgaveReducer,
    eksisterendeSoknaderState: EksisterendeSoknaderReducer,
    eksisterendeOMPKSSoknaderState: EksisterendeOMPKSSoknaderReducer,
    fordelingSettPåVentState: FordelingSettPaaVentReducer,
    fordelingFerdigstillJournalpostState: FordelingFerdigstillJournalpostReducer,
});

export type RootStateType = ReturnType<typeof rootReducer>;
