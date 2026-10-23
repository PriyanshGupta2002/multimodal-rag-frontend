import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteDocument } from "../services/document.service";

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["documents", "delete"],
    mutationFn: deleteDocument,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast.success("Document deleted");
    },
    onError: () => {
      toast.error("Could not delete document. Please try again.");
    },
  });
}
