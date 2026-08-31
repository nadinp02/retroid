import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { WindowPanel } from "@/components/ui/window-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { FieldError } from "@/components/field-error";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function login(formData: FormData) {
    "use server";

    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/administracion",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=1");
      }
      throw err;
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <WindowPanel title="LOGIN" className="w-full max-w-sm">
        <div className="space-y-1.5 border-b border-border p-5">
          <p className="font-mono text-lg font-bold tracking-tight">
            <span className="text-primary">RETROID</span>{" "}
            <span className="text-muted-foreground">— Panel administrativo</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Ingresá con tu cuenta para gestionar el catálogo.
          </p>
        </div>
        <div className="p-5">
          <form action={login} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <FieldError message={error ? "Email o contraseña incorrectos." : undefined} />
            <SubmitButton className="w-full">Ingresar</SubmitButton>
          </form>
        </div>
      </WindowPanel>
    </main>
  );
}
