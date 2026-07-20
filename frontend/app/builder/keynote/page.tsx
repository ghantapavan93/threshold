import { redirect } from "next/navigation";

// The keynote was promoted to the primary Builder page. Preserve this URL by
// redirecting any existing links to /builder.
export default function BuilderKeynoteRoute() {
  redirect("/builder");
}
