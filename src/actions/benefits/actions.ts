"use server";

import { revalidateTag } from "next/cache";
import { requireSession } from "@/auth";
import { createBenefit, updateBenefit, deleteBenefit, reorderBenefits } from "@/services/benefits";
import { emptyFormState, type FormState } from "@/types/form-state";
import { parseBenefitForm } from "./schema";

// Solo variantes "modal" (sin redirect): los beneficios son pocos y se
// editan siempre desde el diálogo de /administracion/beneficios.
export async function createBenefitAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseBenefitForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await createBenefit(parsed.data);
  revalidateTag("benefits");
  return { errors: {}, success: "created" };
}

export async function updateBenefitAction(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const parsed = parseBenefitForm(formData);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await updateBenefit(id, parsed.data);
  revalidateTag("benefits");
  return { errors: {}, success: "updated" };
}

export async function deleteBenefitAction(
  id: string,
  _prevState: FormState,
  _formData: FormData,
): Promise<FormState> {
  await requireSession();

  await deleteBenefit(id);
  revalidateTag("benefits");
  return emptyFormState;
}

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function reorderBenefitsAction(orderedIds: string[]): Promise<ActionResult<null>> {
  await requireSession();

  await reorderBenefits(orderedIds);
  revalidateTag("benefits");
  return { ok: true, data: null };
}
