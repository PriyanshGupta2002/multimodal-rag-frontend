import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteDocuments } from "../services/document.service";

export function useDeleteDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["documents", "delete"],
    mutationFn: deleteDocuments,
    onSuccess: async ({ deletedDocumentIds, failedDocumentIds }) => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });

      if (failedDocumentIds.length > 0 && deletedDocumentIds.length > 0) {
        toast.warning(
          `Deleted ${deletedDocumentIds.length} documents; could not delete ${failedDocumentIds.length}.`,
        );
      } else if (failedDocumentIds.length > 0) {
        toast.error("Could not delete the selected documents. Please try again.");
      } else {
        toast.success(`Deleted ${deletedDocumentIds.length} documents`);
      }
    },
    onError: () => {
      toast.error("Could not delete the selected documents. Please try again.");
    },
  });
}
