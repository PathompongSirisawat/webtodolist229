import { useState } from "react";
import API from "./api";

function Register({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const register = async () => {
    try {
      const res = await API.post("/auth/local/register", {
        username,
        email,
        password,
      });

      localStorage.setItem("token", res.data.jwt);
      onSuccess();
    } catch (err) {
      setError("สมัครสมาชิกไม่สำเร็จ");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">📝 สมัครสมาชิก</h2>

      {error && <p className="text-red-500">{error}</p>}

      <input
        className="border p-2 w-full mb-2"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-4"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={register}
        className="bg-blue-500 text-white w-full py-2 rounded"
      >
        สมัคร
      </button>
    </div>
  );
}

export default Register;