import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryClient";
import { userService } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";

/**
 * The signed-in user's profile.
 *
 * Three components fetched this independently — Navbar, TabsEdit and the
 * settings forms — so opening settings made the same request twice. One query
 * key means one request, shared.
 */
export const useProfile = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: userService.me,
    enabled: isAuthenticated,
  });
};
