import { useEffect } from "react";
import { User, useAuth0 } from "@auth0/auth0-react";

const Profile = (user: User) => {
  const { getAccessTokenSilently } = useAuth0();
  const { picture, name, email } = user.user;

  useEffect(() => {
    async function getData() {
      const token = await getAccessTokenSilently();

      const response = await fetch(`http://localhost:4050/api/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      response.text().then((text) => console.log(text));
    }

    getData();
  }, [user]);

  return (
    <div>
      <img src={picture} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
};

export default Profile;
