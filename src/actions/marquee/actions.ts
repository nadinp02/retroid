"use server";

import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { requireSession } from "@/auth";
import {
  createMarqueeItem,
  updateMarqueeItem,
  deleteMarqueeItem,
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
