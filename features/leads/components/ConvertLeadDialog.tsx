"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useCreateSale } from "@/features/sales/hooks/use-create-sale";
import { useUpdateSale } from "@/features/sales/hooks/use-update-sale";

const DEFAULT_DISPATCH_FEE = 10000;

interface ConvertLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName: string;
  existingSale?: { id: string; dispatchFee: number } | null;
}

// Isolated so state reinitializes on remount (via key in parent)
function ConvertLeadForm({
  leadId,
  leadName,
  existingSale,
  onClose,
}: {
  leadId: string;
  leadName: string;
  existingSale: { id: string; dispatchFee: number } | null;
  onClose: () => void;
}) {
  const isEditing = !!existingSale;
  const [dispatchFee, setDispatchFee] = useState(
    existingSale?.dispatchFee ?? DEFAULT_DISPATCH_FEE,
  );

  const createSale = useCreateSale();
  const updateSale = useUpdateSale(existingSale?.id ?? "", leadId);

  function handleSubmit() {
    if (isEditing) {
      updateSale.mutate({ dispatchFee }, { onSuccess: onClose });
    } else {
      createSale.mutate({ leadId, dispatchFee }, { onSuccess: onClose });
    }
  }

  const isPending = createSale.isPending || updateSale.isPending;
  const error = createSale.error ?? updateSale.error;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-foreground">
          {isEditing ? "Edit Sale" : "Mark as Sale"}
        </DialogTitle>
        <DialogDescription className="text-text-secondary">
          {isEditing
            ? `Update the dispatch fee for ${leadName}.`
            : `Convert ${leadName} to a sale. Set the dispatch fee below.`}
        </DialogDescription>
      </DialogHeader>

      <div className="py-2">
        <div className="space-y-2">
          <Label htmlFor="dispatch-fee" className="text-foreground">
            Dispatch Fee (₦)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm select-none">
              ₦
            </span>
            <Input
              id="dispatch-fee"
              type="number"
              min={0}
              step={100}
              value={dispatchFee}
              onChange={(e) => setDispatchFee(Number(e.target.value))}
              className="pl-7 bg-card border-border focus-visible:ring-accent"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Default: ₦{DEFAULT_DISPATCH_FEE.toLocaleString()}
          </p>
        </div>

        {error && (
          <p className="mt-3 text-sm text-destructive">{error.message}</p>
        )}
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isPending}
          className="border-border"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending || dispatchFee < 0}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isPending
            ? isEditing
              ? "Saving..."
              : "Converting..."
            : isEditing
              ? "Save Changes"
              : "Confirm Sale"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function ConvertLeadDialog({
  open,
  onOpenChange,
  leadId,
  leadName,
  existingSale,
}: ConvertLeadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-100 bg-card border-border">
        {/* key forces ConvertLeadForm to remount whenever the dialog opens with new data */}
        <ConvertLeadForm
          key={`${leadId}-${existingSale?.id ?? "new"}`}
          leadId={leadId}
          leadName={leadName}
          existingSale={existingSale ?? null}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
