---
tags: [moc]
aliases: [Índice, Index]
actualizado: 2026-07-15
---

# Flare OS — Vault de conocimiento

**Flare OS** es una app Next.js de gestión de una agencia de contenido/marketing con dos superficies: el **módulo interno de agencia** y el **[[Portal de clientes]]**. Corre en [[Modo demo vs Supabase|modo demo o con Supabase]].

> Este vault lo mantiene el agente `vault-keeper` al cierre de cada sesión de trabajo. Ver [[Cómo se mantiene este vault]].

## Arquitectura
- [[Stack tecnológico]] · [[Estructura del proyecto]]
- [[Store de agencia (useFlare)]] · [[Store del portal (usePortal)]]
- [[Modo demo vs Supabase]] · [[Seguridad del portal]] · [[Permisos y capacidades]]

## Módulos
- Dashboards: [[Dashboard de clientes]] · [[Dashboard de agencia]]
- Clientes: [[Directorio de clientes]] · [[Vista 360 del cliente]] · [[Facturación]] · [[Métricas]]
- Producción: [[Contenido]] · [[Tareas]]
- Transversales: [[Notificaciones]] · [[Ajustes]] · [[Autenticación y guards]] · [[Portal de clientes]]

## Entidades
[[Client]] · [[Idea]] · [[IdeaComment]] · [[Task]] · [[ClientMetric]] · [[ClientStrategy]] · [[ClientNote]] · [[ClientAccess]] · [[ConnectedAccount]] · [[IntegrationSettings]] · [[ClientMeeting]] · [[ClientBilling]] · [[Profile]] · [[PortalClient]]

## Términos de dominio
[[ClientStatus]] · [[ClientPhase]] · [[HealthStatus]] · [[IdeaStatus]] · [[ClientApproval]] · [[TaskStatus]] · [[TaskArea]] · [[PaymentStatus]] · [[Roles]] · [[Prioridad]] · [[Canales y formatos]] · [[Parrilla de publicación]] · [[Recurso interno]]

## Flujos cross-módulo
- [[Ciclo de vida de una pieza]] — el flujo estrella
- [[Aprobación del cliente]] · [[Alertas operativas]] · [[Progreso operativo]] · [[De reunión a tareas]] · [[Conexión OAuth de Meta]]

## Sesiones
Bitácora en `Sesiones/` — una nota por sesión de trabajo con lo que cambió y qué notas se tocaron.
