import { useState } from "react";
import API from "./api";

function Login({ onSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      const res = await API.post("/auth/local", {
        identifier, // email หรือ username
        password,
      });

      localStorage.setItem("token", res.data.jwt);
      onSuccess();
    } catch (err) {
      setError("Login ไม่สำเร็จ");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">🔐 Login</h2>

      {error && <p className="text-red-500">{error}</p>}

      <input
        className="border p-2 w-full mb-2"
        placeholder="Email หรือ Username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-4"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={login}
        className="bg-green-500 text-white w-full py-2 rounded"
      >
        Login
      </button>
    </div>
  );
}

export default Login;