import { redirect } from "next/navigation";

export default function AgriculturePage() {
  redirect("/listings?world=agriculture");
}
