---
tags: [meta]
actualizado: 2026-07-11
---

# Cómo se mantiene este vault

Este vault vive en `flare vault/` dentro del repo de Flare OS (es la bóveda abierta en Obsidian) y se versiona con git.

## Quién lo actualiza
El agente **`vault-keeper`** (definido en `.claude/agents/vault-keeper.md`). Un hook de Claude Code lo dispara al final de cada sesión; también se puede invocar manualmente pidiéndole a Claude "actualiza el vault".

## Qué hace en cada pasada
1. Mira `git log` y el diff de la sesión para detectar cambios en código.
2. Si aparecen **entidades, campos, estados, módulos o flujos nuevos**, crea o actualiza la nota correspondiente (respetando las convenciones de abajo).
3. Actualiza [[Home]] si hay notas nuevas.
4. Escribe una nota de bitácora en `Sesiones/AAAA-MM-DD — <tema>.md` con resumen de la sesión y enlaces a las notas tocadas.
5. Actualiza el campo `actualizado:` del frontmatter de cada nota que modifique.

## Convenciones
- **Carpetas**: `Arquitectura/`, `Módulos/`, `Entidades/`, `Términos/`, `Flujos/`, `Sesiones/`.
- **Nombres**: entidades con el nombre del código (`Client`, `Idea`); módulos y términos en español.
- **Frontmatter**: `tags` (una de: `arquitectura`, `modulo`, `entidad`, `termino`, `flujo`, `sesion`, `meta`, `moc`), `aliases` opcional, `fuente` (ruta(s) de archivo del código), `actualizado` (fecha ISO).
- **Enlaces**: usar `[[wikilinks]]` de forma generosa — la gracia del vault es el grafo. Un enlace a una nota que aún no existe marca trabajo futuro, no es error.
- **Contenido**: cada nota dice qué es la cosa, dónde vive en el código (`ruta:línea` cuando aplique) y con qué se relaciona. Sin dumps de código.
