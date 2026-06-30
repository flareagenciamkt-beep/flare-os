import { redirect } from "next/navigation";

// Unificado en /agency/content. Redirect para no romper enlaces antiguos.
export default function KanbanRedirect() {
  redirect("/agency/content?view=kanban");
}
