// app/admin/about/components/delete-button.tsx
"use client";

import { Button } from "./inputs";

export default function DeleteButton({
  label = "Löschen",
  confirmText,
  onDelete,
  disabled,
}: {
  label?: string;
  confirmText: string;
  onDelete: () => Promise<void> | void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="danger"
      disabled={disabled}
      onClick={async () => {
        if (!confirm(confirmText)) return;
        await onDelete();
      }}
    >
      {label}
    </Button>
  );
}
