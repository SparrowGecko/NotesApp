import { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    console.log("before fetch: ");;
    fetch("http://localhost:8080/notes", {
      credentials: "include", // 让请求带上 cookie
    })
      .then((res) => {
        console.log("get res: ", res);
        return res.json().catch(err => {
            console.error("JSON Parsing Error:", err);
            return null; // Prevent crash
          });
    })
      .then((data) => {
        console.log("API Response:", data); 
        if (data.user) {
            console.log("user: ", data.user);
          setUser(data.user);
          setNotes(data.notes);
        } else {
          window.location.href = "/"; 
        }
      })
      .catch((err) => console.error("Error fetching notes:", err));
  }, []);
  

  if (!user) return <h2>Loading...</h2>;

  return (
    <div>
      <h1>Welcome, User:{user}!</h1>
      <h2>Your Notes:</h2>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>{note.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default Profile;
