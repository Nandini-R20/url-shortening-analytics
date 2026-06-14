import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export function useUrls() {
  const { data = [] } = useQuery({
    queryKey: ["urls"],
    queryFn: api.getUrls,
  });
  return data;
}

export function useUrlsQuery() {
  return useQuery({
    queryKey: ["urls"],
    queryFn: api.getUrls,
  });
}
