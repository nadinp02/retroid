import { AlertCircle } from "lucide-react";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    // role="alert" (aria-live="assertive" implícito): un usuario de lector
    // de pantalla se entera del error aunque no haya recargado la página ni
    // movido el foco — el mensaje puede aparecer producto de un submit que
    // no cambia la ruta (server action + useActionState).
    <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
      <AlertCircle className="size-3.5 shrink-0" />
      {message}
    </p>
  );
}
