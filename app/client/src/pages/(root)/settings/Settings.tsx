import ChangeTheme from "@/components/change-theme";
import Loading from "@/components/loader";
import { useUser } from "@/context/UserContext";



const Profile = () => {
  const { pending } = useUser();

  if (pending) {
    return <Loading />;
  }

  return (
    <ChangeTheme />
  );
};

export default Profile;