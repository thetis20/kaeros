# Kaeros mockups

This folder contains a navigable HTML/CSS/JS mockup of the Kaeros interface, built to think through the screens before implementation. It has no build step: opening `index.html` in a browser is enough. The only external dependency is the Tabler icon font, loaded from a CDN (jsDelivr), so an internet connection is needed for the icons to render.

## Navigation structure

The left-hand menu has three entries: Régie (the default screen on open), then a Bibliothèque (Library) category grouping Musique (Music) and Sessions. There is no separate home screen — Régie acts as the main entry point, whether or not a session is currently running.

Next to the "Régie" label in the menu, two small tags appear dynamically: a screen icon when a session is currently running, and a music icon when at least one track is playing. They update automatically based on the app's state.

## Mapping to the current codebase

The step types used in the mockup match exactly what's defined in `public/script/application/entity/step/` and `src/component/Step/` in the real code: `image`, `dubbing-video` (a file plus a free-text duration field plus a description shown before playback), `time` (configured by a number of improvisations and a number of minutes, not a plain duration), and `battle-royal` (a list of players with scores). These are the only step types actually implemented today; there is no generic video type independent from dubbing.

The Workflow/Session distinction from the code (the scenario prepared ahead of time vs. the live-running instance) has been deliberately collapsed into a single word, "Session", at the product owner's request — which recreates the ambiguity already present in the current UI, where both concepts are labelled "Sessions" in French. This is a conscious choice, not an oversight, but worth keeping in mind if a clearer split becomes necessary in the implementation.

## Departures from the current codebase (proposed evolutions, not existing behavior)

The music library in the mockup replaces the colored-folder system (`Folder` + `Audio`) currently in the code with a flat tag system (Bruitage/Sound effect, Musique/Music, Disco), with a dedicated screen for configuring tracks (add, tag, delete) rather than just playing them. This is an extension to the `Audio` model that would need to be built, not something that exists yet.

The Régie screen has an empty state (a list of sessions to start) when no session is running, with a music block that stays visible and can be used independently — useful for events that only need music with no scenario. The "Session" block can be collapsed via a chevron for the same use case.

No volume, loop, or display-style field exists in the current code for videos — those settings are therefore not part of the mockup. "Time Spinoff" appears in the French translations (`translation.fr.json`) but isn't wired into the current step logic; it wasn't included either, and should be checked against the roadmap.

## Limitations of the mockup

Everything is simulated client-side, with no persistence and no real file import: the "Choose a file" buttons don't open a system picker, and data resets on every page reload. The goal is to validate the flows and interactions before implementing them against real Electron/React data.
