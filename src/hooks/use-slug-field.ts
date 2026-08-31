"use client";

import { useState } from "react";
import { slugify } from "@/utils/slug";

/**
 * Sincroniza un campo slug con un campo nombre hasta que el usuario edite el
 * slug a mano — a partir de ahí deja de seguir al nombre (así no le pisa un
 * slug que ya haya elegido a propósito). En modo edición (initialSlug ya
 * viene de la base) arranca "tocado": no queremos reescribir una URL que ya
 * está publicada solo porque se corrigió el nombre.
 */
export function useSlugField(initialName = "", initialSlug = "") {
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [slugTouched, setSlugTouched] = useState(initialSlug.length > 0);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlug(value);
    setSlugTouched(true);
  }

  function regenerateSlug() {
    setSlug(slugify(name));
    setSlugTouched(false);
  }

  return { name, slug, slugTouched, handleNameChange, handleSlugChange, regenerateSlug };
}
