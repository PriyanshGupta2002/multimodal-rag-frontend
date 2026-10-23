import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteThread } from "../services/chat-service";

export function useDeleteThread() {
  return useMutation({
    mutationKey: ["threads", "delete"],
    mutationFn: deleteThread,
    onSuccess: () => {
      toast.success("Conversation deleted");
    },
    onError: () => {
      toast.error("Could not delete conversation. Please try again.");
    },
  });
}
