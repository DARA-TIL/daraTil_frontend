import { create } from "zustand";

export type ConfirmDialogVariant = "default" | "danger";

export type ConfirmDialogOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
};

type ConfirmDialogState = {
  open: boolean;
  options: ConfirmDialogOptions | null;
  requestConfirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  resolveConfirm: (confirmed: boolean) => void;
  resolver: ((confirmed: boolean) => void) | null;
};

export const useConfirmDialogStore = create<ConfirmDialogState>((set, get) => ({
  open: false,
  options: null,
  resolver: null,

  requestConfirm: (options) =>
    new Promise<boolean>((resolve) => {
      const previousResolver = get().resolver;
      previousResolver?.(false);

      set({
        open: true,
        options,
        resolver: resolve,
      });
    }),

  resolveConfirm: (confirmed) => {
    const resolver = get().resolver;

    set({
      open: false,
      options: null,
      resolver: null,
    });

    resolver?.(confirmed);
  },
}));

export function requestConfirm(options: ConfirmDialogOptions): Promise<boolean> {
  return useConfirmDialogStore.getState().requestConfirm(options);
}
