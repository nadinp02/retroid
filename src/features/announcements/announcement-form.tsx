"use client";

import { useActionState } from "react";
import type { Announcement } from "@prisma/client";
import { WindowPanel } from "@/components/ui/window-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/submit-button";
import { FieldError } from "@/components/field-error";
import { updateAnnouncementAction } from "@/actions/announcements/actions";
import { emptyFormState } from "@/types/form-state";

// El announcement llega de getAnnouncement(), que pasa por unstable_cache:
// el valor cacheado se serializa, así que startAt/endAt pueden llegar como
// string en vez de Date (mismo problema ya resuelto para este mismo dato en
// getActiveAnnouncement()/announcement-popup.tsx). new Date(...) normaliza
// ambos casos — sin esto, un string no tiene método toISOString y esta
// página tira un 500 apenas hay una fecha cargada.
function toDateInputValue(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function AnnouncementForm({ announcement }: { announcement: Announcement | null }) {
  const [state, formAction] = useActionState(updateAnnouncementAction, emptyFormState);

  return (
    <WindowPanel title="CARTEL FLOTANTE" className="max-w-xl">
      <div className="p-5">
        <form action={formAction} className="space-y-5">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              name="isActive"
              defaultChecked={announcement?.isActive ?? false}
            />
            <Label htmlFor="isActive">Activo</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startAt">Fecha inicio</Label>
              <Input
                id="startAt"
                name="startAt"
                type="date"
                defaultValue={toDateInputValue(announcement?.startAt ?? null)}
              />
              <FieldError message={state.errors.startAt?.[0]} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endAt">Fecha fin</Label>
              <Input
                id="endAt"
                name="endAt"
                type="date"
                defaultValue={toDateInputValue(announcement?.endAt ?? null)}
              />
              <FieldError message={state.errors.endAt?.[0]} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" defaultValue={announcement?.title} required />
            <FieldError message={state.errors.title?.[0]} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={announcement?.description ?? ""}
            />
            <FieldError message={state.errors.description?.[0]} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="buttonText">Texto del botón</Label>
            <Input
              id="buttonText"
              name="buttonText"
              placeholder="Ver más"
              defaultValue={announcement?.buttonText ?? ""}
            />
            <FieldError message={state.errors.buttonText?.[0]} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://..."
              defaultValue={announcement?.url ?? ""}
            />
            <FieldError message={state.errors.url?.[0]} />
          </div>

          <SubmitButton className="w-full sm:w-auto">Guardar cambios</SubmitButton>
        </form>
      </div>
    </WindowPanel>
  );
}
