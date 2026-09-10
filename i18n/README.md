# Localization system

The site has a typed locale catalog and keeps interface, documentation, and code examples separated by responsibility. `pt-BR`, `en-US`, and `es-ES` are currently registered, all with guides, system manuals, and a complete API reference.

## Structure

- `config.ts`: available locales, default locale, and persistence keys.
- `locales/<locale>/ui.ts`: short interface texts (shell copy, shared by every project).
- `locales/<locale>/reference.ts`: API reference page texts.
- `content.ts`: pack loader that reads guides, manuals, and the API reference from the project folder.
- `documentation/<project>/<locale>/guides`: localized Markdown. The `gml` blocks belong to the document and can localize comments, messages, and sample data.
- `documentation/<project>/<locale>/systems`: system manuals and their code.
- `documentation/<project>/<locale>/api-reference.json`: complete source of the reference.
- `documentation/<project>/<locale>/metadata.json`: eyebrow/description per guide and system, plus category descriptions (object key order defines the sidebar order).
- `documentation/<project>/<locale>/messages.json`: page copy that overrides the shell texts for that project.

## How content loading works

`getContentPack(project, locale)` in `i18n/content.ts` discovers the folder structure:

1. guides and systems are scanned from the locale folders (`metadata.json` keys come first, then remaining files);
2. complements come from `documentation/<project>/complements.json` plus each `complements/<id>/meta.json`;
3. the API reference is read from `api-reference.json` and merged with complement entries;
4. heading anchor IDs are taken from the project's canonical locale (default `en-US`) so anchors stay stable across languages.

## How to add a locale

1. Register the locale in `config.ts`.
2. Create `locales/<locale>/ui.ts` with all `MessageKey` keys (interface texts are shared across projects).
3. Add the Markdown files for the translated documents inside the project folder.
4. Optionally add `messages.json` and `metadata.json` overrides for the project.

## Code localization

Engine identifiers, function names, and signatures must stay identical. Comments, player-facing strings, and sample values can be localized.

In guides, code lives inside the locale's Markdown. In the individual reference, entries can be overridden via `api-reference.json`. Content that is not yet translated falls back to the canonical locale's pack, so a locale can be published gradually without empty pages or duplicated structures.