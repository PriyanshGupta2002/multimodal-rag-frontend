import { useQuery } from "@tanstack/react-query";
import { getDocuments } from "../services/document.service";

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });
}
