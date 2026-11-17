/**
 * Shared 3D-scene colour palette.
 * Three.js cannot read CSS variables, so literal hex values are used here.
 * Values are aligned to the design tokens in src/index.css.
 */

// ── Existing / default node ─────────────────────────────────────────────
// Olive-green cube faces under directional light.
// Three.js meshStandardMaterial interprets the colour as the diffuse albedo;
// lighting darkens side/bottom faces automatically.
export const COLOR_NODE         = '#5a6b48'; // front face (medium olive-green)
export const COLOR_NODE_TOP     = '#c7e59d'; // ← brighter top baked-in via emissive below
// Because standard material can't set per-face colour, we use one material
// with a slight emissive boost to lift the apparent top. Scenes set both.
export const COLOR_NODE_EMISSIVE = '#1a2110'; // small emissive to warm the green

// ── New node ────────────────────────────────────────────────────────────
export const COLOR_NEW          = '#7c5fc4'; // purple body (front/side)
export const COLOR_NEW_EMISSIVE = '#2a1a4a'; // purple emissive warmth

// ── Visited node (traverse / temp walk) ────────────────────────────────
// Soft lime outline — rendered as a distinct material tint, not purple.
export const COLOR_VISITED      = '#4a5c38'; // slightly lighter olive (accent-tinted)
export const COLOR_VISITED_EMISSIVE = '#1e2e0e';

// ── Found node (find result) ────────────────────────────────────────────
export const COLOR_FOUND        = '#3a5020'; // dark lime-green body
export const COLOR_FOUND_EMISSIVE = '#4a7a10'; // lift the lime

// ── Pointer cell (darker than data cell) ───────────────────────────────
export const COLOR_PTR          = '#3d4d2e'; // darker olive for pointer half
export const COLOR_PTR_NEW      = '#4a3080'; // darker purple for new-node pointer half

// ── Arrows ──────────────────────────────────────────────────────────────
export const COLOR_ARROW        = '#c7f36b'; // lime — matches --accent

// ── Head / label box ────────────────────────────────────────────────────
export const COLOR_HEAD_BOX     = '#1a1f14'; // very dark olive-tinted box

// ── Stack base plate ────────────────────────────────────────────────────
export const COLOR_BASE         = '#1c2029';

// ── Text colours ────────────────────────────────────────────────────────
export const COLOR_TEXT         = '#e8eaf0'; // bright label text
export const COLOR_TEXT_MUTED   = '#7b8099'; // dim labels (address, head word)
export const COLOR_TEXT_DIM     = '#454d63'; // null / tail / very dim
export const COLOR_TEXT_ON_LIME = '#0d1a00'; // dark text on lime chips

// ── Lime chip (head → / top → labels) ──────────────────────────────────
export const COLOR_CHIP_BG      = '#c7f36b'; // lime fill
export const COLOR_CHIP_TEXT    = '#0d1a00'; // dark text

// ── Error ────────────────────────────────────────────────────────────────
export const COLOR_ERROR        = '#f87171';
