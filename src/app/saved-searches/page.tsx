import { redirect } from "next/navigation";

export default function SavedSearchesPage() {
  redirect("/dashboard?tab=saved-searches");
}
