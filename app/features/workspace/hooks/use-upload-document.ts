import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadDocument } from "../services/document.service";

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["documents", "upload"],
    mutationFn: uploadDocument,

    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["documents"] });

      toast.success("Document uploaded", {
        description:
          result.message ??
          result.filename ??
          "Document uploaded successfully.",
      });
    },

    onError: () => {
      toast.error("Upload failed", {
        description: "Please try again.",
      });
    },
  });
}
