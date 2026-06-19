import { redirect } from "next/navigation";

// App entry — sends users into Mission Control.
export default function AppEntry() {
  redirect("/dashboard");
}
