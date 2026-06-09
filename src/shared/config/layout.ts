// Shared layout constants — single source of truth so the NavBar height and the
// RootLayout horizontal padding can't drift out of sync with pages that depend
// on them (e.g. the full-bleed landing page).

/** Fixed NavBar toolbar height in pixels. Used by NavBar and as a top offset by pages. */
export const NAVBAR_HEIGHT = 74;

const PAGE_PX_UNITS = { xs: 2, md: 4 } as const;

/** Horizontal padding (MUI spacing units) applied to the main content area in RootLayout. */
export const PAGE_PX = PAGE_PX_UNITS;

/** Negated PAGE_PX, used by full-bleed pages to cancel the RootLayout padding. */
export const PAGE_PX_NEGATIVE = {
  xs: -PAGE_PX_UNITS.xs,
  md: -PAGE_PX_UNITS.md,
} as const;
