#!/bin/bash
# SessionStart hook: recuerda a Claude mantener el vault de Obsidian al día en cada sesión.
cat <<'EOF'
{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"Este proyecto mantiene un vault de Obsidian en 'flare vault/' (términos, entidades, módulos y relaciones de Flare OS), actualizado por el agente vault-keeper (.claude/agents/vault-keeper.md). REGLA DE SESIÓN: cuando el trabajo significativo de la sesión esté terminado (cambios en lib/types.ts, lib/store.tsx, lib/stats.ts, supabase/, rutas app/ o módulos nuevos), lanza el agente vault-keeper con la tarea 'Actualiza el vault con los cambios de esta sesión' antes de cerrar. Si la sesión no tocó código de dominio (solo estilos, copys o conversación), no hace falta lanzarlo."}}
EOF
