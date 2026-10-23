import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateThread } from "../services/chat-service";

export function useUpdateThread() {
  return useMutation({
    mutationKey: ["threads", "update"],
    mutationFn: ({
      threadId,
      title,
    }: {
      threadId: string;
      title: string;
    }) => updateThread(threadId, title),
    onSuccess: () => {
      toast.success("Conversation renamed");
    },
    onError: () => {
      toast.error("Could not rename conversation. Please try again.");
    },
  });
}
