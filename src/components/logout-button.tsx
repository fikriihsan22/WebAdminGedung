import { logoutAction } from "@/app/logout/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="text-sm font-medium text-muted-foreground hover:text-foreground" type="submit">
        Keluar
      </button>
    </form>
  );
}
