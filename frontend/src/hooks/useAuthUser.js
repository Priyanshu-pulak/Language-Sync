import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false, // auth check, so no retry on failure
  });

  return { isLoading: authUser.isLoading, authUser: authUser.data?.user };
  // .user because the response from backend is {user: {...} } if {userx: {...} } then authData?.userx
};
export default useAuthUser;