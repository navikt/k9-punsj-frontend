---
name: aksel-spacing
description: Responsive layout and spacing patterns for k9-punsj-frontend using Aksel primitives and spacing tokens
---

# Aksel spacing skill

> Merk: Denne varianten er tilpasset `k9-punsj-frontend`.
> Generiske eksempler er strammet inn for å passe repoets Aksel, Tailwind og lokale stylingregler.
> Hvis skillen skal gjenbrukes i et annet frontend repo, oppdater repo kontekst, versjonsforutsetninger og stylingregler først.

Use this skill when the task is about layout, spacing, responsive structure, or spacing cleanup in `k9-punsj-frontend`.

## Repo rules

- Prefer Aksel layout primitives such as `Box`, `VStack`, `HStack`, and `HGrid`.
- Prefer Aksel spacing tokens such as `space-4`, `space-6`, and `space-8`.
- Do not add Tailwind padding or margin utilities to Aksel components.
- Tailwind is acceptable for wrapper level layout when Aksel props are not a good fit, for example `max-w-*`, `mx-auto`, or simple grid wrappers.
- Keep future Aksel v8 migration cost low. Avoid adding new v7 specific workaround patterns unless the task requires them.

## Current repo context

- The repo currently uses `@navikt/ds-react` and `@navikt/aksel-icons` in version `7.37.0`.
- Layout and spacing should follow the shared repo rules in `AGENTS.md` and `.github/copilot-instructions.md`.
- UI text is usually Norwegian and often comes from `react-intl`. Do not rename translation ids when the task is only visual.

## Recommended patterns

### Page section

```tsx
import { Box, VStack } from '@navikt/ds-react';

export function Section({ children }: { children: React.ReactNode }) {
  return (
    <Box padding={{ xs: 'space-4', md: 'space-6' }}>
      <VStack gap={{ xs: 'space-4', md: 'space-6' }}>{children}</VStack>
    </Box>
  );
}
```

### Card content

```tsx
import { Box, VStack, Heading } from '@navikt/ds-react';

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box borderWidth="1" borderRadius="large" padding={{ xs: 'space-4', md: 'space-6' }}>
      <VStack gap="space-4">
        <Heading size="small">{title}</Heading>
        {children}
      </VStack>
    </Box>
  );
}
```

### Responsive columns

```tsx
import { HGrid, Box } from '@navikt/ds-react';

export function TwoColumn({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <HGrid columns={{ xs: 1, md: 2 }} gap="space-6">
      <Box>{left}</Box>
      <Box>{right}</Box>
    </HGrid>
  );
}
```

## Avoid

```tsx
// Avoid spacing with Tailwind on Aksel components
<Box className="p-4 md:p-6 mb-4" />

// Prefer spacing props and tokens
<Box padding={{ xs: 'space-4', md: 'space-6' }} marginBlock="space-4" />
```

## Review checklist

- Spacing uses Aksel tokens instead of ad hoc pixel values.
- Layout primitives are preferred over nested `div` wrappers.
- Tailwind spacing utilities are not mixed into Aksel components.
- Responsive behavior is expressed in props where possible.
- The change does not add new Aksel v7 only patterns without need.
