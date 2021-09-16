import { rest } from 'msw';

export const handlers = [
  // Handles a POST /login request
  rest.get('http://localhost:8101/me', (req, res, ctx) => {
    return res(ctx.status(401, 'top kek'));
  }),
  rest.get('http://localhost:8101/api/k9-punsj/barn', (req, res, ctx) => {
    return res(ctx.status(401, 'top kek'));
  }),

  rest.post(
    'http://localhost:8101/api/k9-punsj/pleiepenger-sykt-barn-soknad/valider',
    (req, res, ctx) => {
      console.log('hallo');
      return res(
        ctx.status([
          [
            {
              felt: 'arbeidstid.arbeidstakerList[0]',
              feilkode: 'påkrevd',
              feilmelding:
                'Mangler ID på Arbeidsgiver, må oppgi en av norskIdentitetsnummer eller organisasjonsnummer.',
            },
            {
              felt: 'søker',
              feilkode: 'søkerSammeSomBarn',
              feilmelding: 'Søker kan ikke være barn.',
            },
            {
              felt: 'arbeidstid.arbeidstakerList[0]',
              feilkode: 'påkrevd',
              feilmelding:
                'Mangler ID på Arbeidsgiver, må oppgi en av norskIdentitetsnummer eller organisasjonsnummer.',
            },
            {
              felt: 'arbeidstid.arbeidstaker[0][0]',
              feilkode: 'ugyldigPeriode',
              feilmelding:
                'Fra og med (FOM) må være før eller lik til og med (TOM).',
            },
            {
              felt: 'arbeidstid.arbeidstaker[0]',
              feilkode: 'IllegalArgumentException',
              feilmelding:
                'Til og med dato før fra og med dato: 2021-09-08>2021-09-06',
            },
          ],
        ])
      );
    }
  ),
];
