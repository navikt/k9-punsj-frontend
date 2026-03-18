---
name: aksel-component
description: Create or update a React component in k9-punsj-frontend using Aksel, repo spacing rules, and existing UI patterns
---

> Merk: Denne varianten er tilpasset `k9-punsj-frontend`.
> Basert på upstream prompten `aksel-component.prompt.md` fra `navikt/copilot`:
> `https://raw.githubusercontent.com/navikt/copilot/main/.github/prompts/aksel-component.prompt.md`
> Hvis prompten skal gjenbrukes i et annet frontend repo, oppdater repo kontekst, UI regler og komponentmønstre først.

You are working in `k9-punsj-frontend`.

Your job is to create or update a React component using the repo's existing Aksel, Tailwind, and `react-intl` patterns.

## First, clarify the task

If the user has not already specified them, ask for:

1. Target component or file path
2. Whether this is a new component or an update to an existing one
3. The purpose of the change
4. Whether the task includes text changes, interaction changes, or only visual changes
5. Whether there is an existing nearby component or screen that should be followed

## Repo specific rules

1. Prefer editing an existing component or following a nearby repo pattern before introducing a new component shape.
2. Prefer Aksel components, layout primitives, and spacing tokens for UI work.
3. Prefer the styling order used in the repo: Aksel props first, Tailwind utilities selectively, local component CSS when needed.
4. Do not use Tailwind padding or margin utilities on Aksel components.
5. Tailwind is acceptable for wrapper level layout when Aksel props or primitives are not a good fit.
6. Keep future Aksel v8 migration cost low. Avoid adding new v7 specific workaround patterns unless the task requires them.
7. Preserve existing `react-intl` ids, placeholders, and interpolation variables unless the task explicitly includes translation key changes.
8. Use Norwegian names for domain specific identifiers when the touched code already follows that pattern.
9. Use English names for generic technical helpers and cross cutting code.
10. Do not add new dependencies unless the task explicitly requires them.

## Before writing code

Inspect the touched area for:

- existing Aksel component usage
- existing spacing and layout patterns
- nearby Tailwind usage
- local CSS files
- `react-intl` usage
- existing tests or stories for the touched component

Follow the existing pattern in the touched area unless the task explicitly asks for cleanup or redesign.

## Prefer these patterns

### Section wrapper

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

### Card like content

```tsx
import { Box, Heading, VStack } from '@navikt/ds-react';

interface ExampleCardProps {
  title: string;
  children: React.ReactNode;
}

export function ExampleCard({ title, children }: ExampleCardProps) {
  return (
    <Box borderWidth="1" borderRadius="large" padding={{ xs: 'space-4', md: 'space-6' }}>
      <VStack gap="space-4">
        <Heading size="small" level="2">
          {title}
        </Heading>
        {children}
      </VStack>
    </Box>
  );
}
```

### Responsive columns

```tsx
import { Box, HGrid } from '@navikt/ds-react';

export function TwoColumnLayout({
  left,
  right
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
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
// Avoid Tailwind spacing utilities on Aksel components
<Box className="p-4 md:p-6 mb-4" />

// Prefer Aksel spacing props
<Box padding={{ xs: 'space-4', md: 'space-6' }} marginBlock="space-4" />
```

```tsx
// Avoid renaming translation ids in a visual only task
<FormattedMessage id="existing.key" />
```

## Do not do these things

- Do not start an Aksel v8 migration
- Do not invent a new design direction if the task is only implementation focused
- Do not pull visual decisions from Figma unless the task explicitly asks for design alignment
- Do not rename `react-intl` ids casually
- Do not rewrite unrelated components in the same area

## Testing and validation

- Add or update the smallest relevant test when the change affects behavior or regression risk.
- If the task is purely visual and the repo has no useful test pattern for that change, say so clearly instead of inventing a heavy test setup.
- Mention which files were changed and which checks were run.

## Expected output

When you answer:

1. Keep the change scoped to the task
2. Reuse existing repo patterns
3. Call out any assumptions
4. Mention validation or missing validation clearly
