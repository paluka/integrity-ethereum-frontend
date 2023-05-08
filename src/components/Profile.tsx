import { useEffect, useState } from "react";
import { User, useAuth0 } from "@auth0/auth0-react";
import { css } from "@emotion/react";
import { SHA256 } from "crypto-js";
import Loading from "./Loading";

const columnTitleStyle = css`
  display: flex;
  justify-content: space-between;
  padding: 10px;
`;

const dataContainerStyle = css`
  display: "flex";
  flex-direction: column;
`;

const Profile = (user: User) => {
  const [isLoading, setIsLoading] = useState(true);
  const [uiData, setUiData] = useState([""]);
  const [hashData, setHashData] = useState("");
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");
  const [uploadType, setUploadType] = useState("");
  const [isUploadDisabled, setIsUploadDisabled] = useState(true);

  const { getAccessTokenSilently, logout } = useAuth0();
  const { picture, name, email } = user.user;

  async function getData() {
    const token = await getAccessTokenSilently();

    try {
      const response = await fetch(`http://localhost:4050/api/user`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      response.json().then((json) => {
        setUiData(json);
        setIsLoading(false);
        setFilePath("");
        setFileName("");
        setHashData("");
      });
    } catch (error: any) {
      console.error("Error getting user data:", error);
    }
  }

  useEffect(() => {
    getData();
  }, [user]);

  useEffect(() => {
    async function sendHashToBackend() {
      const token = await getAccessTokenSilently();

      setIsLoading(true);

      try {
        const response = await fetch(
          `http://localhost:4050/api/${uploadType}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, name: fileName, hash: hashData }),
          }
        );

        response.text().then((text) => {
          console.log(text);
          getData();
        });
      } catch (error: any) {
        console.error(`Error calling ${uploadType} endpoint:`, error);
      }
    }

    if (!isLoading && hashData) {
      sendHashToBackend();
    }
  }, [hashData]);

  function handleFileUploadClick() {
    setIsUploadDisabled(true);
    setUploadType("add");

    const file = (
      document.getElementsByName("fileUpload")[0] as HTMLInputElement
    ).files![0];

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const fileContent = event.target!.result;
      const hashDigest = SHA256(fileContent as string);
      const hashString = hashDigest.toString();
      setHashData(hashString);
    };
    reader.readAsText(file);
  }

  function handleFileVerifyClick() {
    setIsUploadDisabled(true);
    setUploadType("verify");

    const file = (
      document.getElementsByName("fileUpload")[0] as HTMLInputElement
    ).files![0];

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const fileContent = event.target!.result;
      const hashDigest = SHA256(fileContent as string);
      const hashString = hashDigest.toString();
      setHashData(hashString);
    };
    reader.readAsText(file);
  }

  function handleFileUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newPath = event.target.value;
    setFilePath(newPath);

    if (newPath && fileName) {
      setIsUploadDisabled(false);
    } else {
      setIsUploadDisabled(true);
    }
  }

  function handleFileNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newName = event.target.value;
    setFileName(newName);

    if (newName && filePath) {
      setIsUploadDisabled(false);
    } else {
      setIsUploadDisabled(true);
    }
  }

  function displayData(data: any) {
    const rows = data.transactions.map((item: any, index: number) => (
      <div css={columnTitleStyle}>
        <div key={`${index}-0`}>{item[0]}</div>
        <div key={`${index}-1`}>{item[1]}</div>
      </div>
    ));

    return (
      <div>
        <div css={columnTitleStyle}>
          <input
            type="text"
            name="fileName"
            placeholder="Enter file name"
            onChange={handleFileNameChange}
            style={{ padding: "10px" }}
          />
          <input
            style={{ padding: "10px" }}
            type="file"
            name="fileUpload"
            onChange={handleFileUploadChange}
          />
          <button
            disabled={isUploadDisabled}
            onClick={handleFileUploadClick}
            style={{ padding: "10px" }}
          >
            Click To Upload File
          </button>
          <button
            disabled={isUploadDisabled}
            onClick={handleFileVerifyClick}
            style={{ padding: "10px" }}
          >
            Click To Verify File
          </button>
        </div>
        <div css={columnTitleStyle}>
          <div>Name</div>
          <div>Transaction</div>
        </div>
        <div css={dataContainerStyle}>{...rows}</div>
      </div>
    );
  }

  return (
    <div style={{ margin: "20px" }}>
      <img src={picture} alt={name} /> <h2>{name}</h2>
      <p>{email}</p>
      <button
        onClick={() =>
          logout({
            logoutParams: { returnTo: window.location.origin },
          })
        }
      >
        Log Out
      </button>
      {isLoading && <Loading />}
      {!isLoading && displayData(uiData)}
    </div>
  );
};

export default Profile;
