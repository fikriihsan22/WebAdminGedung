export function EventSessionLabel({ session }: { session: "DAY" | "NIGHT" }) {
  return <span>{session === "DAY" ? "Siang" : "Malam"}</span>;
}
