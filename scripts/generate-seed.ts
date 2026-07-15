// Genera supabase/seed.sql a partir de los datos mock.
// Uso: npx tsx scripts/generate-seed.ts

import { writeFileSync } from "node:fs";
import {
  MOCK_ACCESS,
  MOCK_BILLING,
  MOCK_CONNECTED_ACCOUNTS,
  MOCK_CLIENT_NOTES,
  MOCK_CLIENTS,
  MOCK_IDEAS,
  MOCK_MEETINGS,
  MOCK_METRICS,
  MOCK_STRATEGIES,
  MOCK_TASKS,
} from "../lib/mock-data";

type Row = Record<string, unknown>;

const toSnake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value) || typeof value === "object")
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

function insertStatement(table: string, rows: Row[], fill: Row = {}): string {
  if (!rows.length) return "";
  const keys = Array.from(
    rows.reduce((set, row) => {
      Object.keys({ ...fill, ...row }).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  );
  const columns = keys.map((k) => `"${toSnake(k)}"`).join(", ");
  const values = rows
    .map((row) => {
      const merged = { ...fill, ...row };
      return `  (${keys.map((k) => sqlValue(merged[k])).join(", ")})`;
    })
    .join(",\n");
  return `insert into public.${table} (${columns}) values\n${values};\n`;
}

const sql = [
  "-- ─── Flare OS — Seed inicial (generado desde lib/mock-data.ts) ─────────────",
  "-- Ejecutar en Supabase → SQL Editor DESPUÉS de schema.sql y las migraciones.",
  "",
  insertStatement("clients", MOCK_CLIENTS as unknown as Row[]),
  insertStatement("ideas", MOCK_IDEAS as unknown as Row[], {
    coverImage: "",
    clientApproval: "pendiente",
    clientFeedback: "",
    clientApprovalAt: null,
    copy: "",
    script: "",
    designNotes: "",
    externalUrl: "",
  }),
  insertStatement("tasks", MOCK_TASKS as unknown as Row[], { meetingId: null }),
  insertStatement("client_metrics", MOCK_METRICS as unknown as Row[]),
  insertStatement("client_strategy", MOCK_STRATEGIES as unknown as Row[]),
  insertStatement("client_notes", MOCK_CLIENT_NOTES as unknown as Row[]),
  insertStatement("client_access", MOCK_ACCESS as unknown as Row[]),
  insertStatement("connected_accounts", MOCK_CONNECTED_ACCOUNTS as unknown as Row[]),
  insertStatement("client_meetings", MOCK_MEETINGS as unknown as Row[]),
  insertStatement("client_billing", MOCK_BILLING as unknown as Row[]),
].join("\n");

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log("supabase/seed.sql generado");
