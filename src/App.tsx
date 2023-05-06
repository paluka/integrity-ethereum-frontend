import { useAuth0 } from "@auth0/auth0-react";
import viteLogo from "/vite.svg";
import Loading from "./components/Loading";
import Profile from "./components/Profile";
import "./App.css";

function App() {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading, error } =
    useAuth0();

  if (isAuthenticated) {
    console.log("logged in");
  } else {
    console.log("logged out");
  }

  if (error) {
    console.error("Error:", error);
  }

  const content = isLoading ? (
    <Loading />
  ) : !isAuthenticated ? (
    <button onClick={() => loginWithRedirect()}>Sign In</button>
  ) : (
    <>
      <Profile user={user} />
      <button
        onClick={() =>
          logout({
            logoutParams: { returnTo: window.location.origin },
          })
        }
      >
        Log Out
      </button>
    </>
  );

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Integrity Using Ethereum</h1>
      <div className="card">{content}</div>
    </>
  );
}

export default App;
