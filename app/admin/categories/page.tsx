import { redirect } from "next/navigation";

/** Categories are managed inside the Projects page now. */
export default function AdminCategoriesPage() {
  redirect("/admin/projects");
}
