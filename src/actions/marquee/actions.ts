"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { requireSession } from "@/auth";
import {
  createMarqueeItem,
  updateMarqueeItem,
  deleteMarqueeItem,
  deleteMarqueeItems,
  bulkUpdateMarqueeItemsActive,
  reorderMarqueeItems,
} from "@/services/marquee";
import { emptyFormState, type FormState } from "@/types/form-state";
import { parseMarqueeItemForm } from "./schema";

export async function createMarqueeItemAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseMarqueeItemForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await createMarqueeItem(parsed.data);
  revalidateTag("marquee");
  redirect("/administracion/marquee");
}

export async function updateMarqueeItemAction(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseMarqueeItemForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await updateMarqueeItem(id, parsed.data);
  revalidateTag("marquee");
  redirect("/administracion/marquee");
}

// Variantes "modal": misma validación y mutación que las de arriba, pero sin
// redirect() — las usa MarqueeItemFormDialog, que necesita quedarse en la
// misma página para cerrar el modal y refrescar la lista in-place. Las de
// arriba se mantienen intactas para /nuevo y /[id]/editar.
export async function createMarqueeItemModalAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseMarqueeItemForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await createMarqueeItem(parsed.data);
  revalidateTag("marquee");
  return { errors: {}, success: "created" };
}

export async function updateMarqueeItemModalAction(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseMarqueeItemForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await updateMarqueeItem(id, parsed.data);
  revalidateTag("marquee");
  return { errors: {}, success: "updated" };
}

export async function deleteMarqueeItemAction(
  id: string,
  _prevState: FormState,
  _formData: FormData,
): Promise<FormState> {
  await requireSession();

  await deleteMarqueeItem(id);
  revalidateTag("marquee");
  return emptyFormState;
}

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function reorderMarqueeItemsAction(orderedIds: string[]): Promise<ActionResult<null>> {
  await requireSession();

  await reorderMarqueeItems(orderedIds);
  revalidateTag("marquee");
  return { ok: true, data: null };
}

export async function bulkDeleteMarqueeItemsAction(ids: string[]): Promise<ActionResult<null>> {
  await requireSession();
  if (ids.length === 0) return { ok: true, data: null };

  await deleteMarqueeItems(ids);
  revalidateTag("marquee");
  return { ok: true, data: null };
}

export async function bulkUpdateMarqueeItemsActiveAction(
  ids: string[],
  isActive: boolean,
): Promise<ActionResult<null>> {
  await requireSession();
  if (ids.length === 0) return { ok: true, data: null };

  await bulkUpdateMarqueeItemsActive(ids, isActive);
  revalidateTag("marquee");
  return { ok: true, data: null };
}
