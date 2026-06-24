import { useState } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Simple fake validation (frontend only)
    if (email === "admin@gmail.com" && password === "1234") {
      setMessage("Login successful 🎉");
    } else {
      setMessage("Invalid email or password ❌");
    }
  };

  return (
    <div style={styles.container}>
      <h2>User Login</h2>

      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "100px",
    fontFamily: "Arial",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    width: "250px",
    margin: "auto",
    gap: "10px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
  },
  button: {
    padding: "10px",
    backgroundColor: "blue",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default App;
