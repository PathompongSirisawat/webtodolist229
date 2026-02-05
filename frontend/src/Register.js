import { useState } from "react";
import API from "./api";

function Register({ onSuccess, onNavigateToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const register = async () => {
    // ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!username || !email || !password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

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
    <div className="min-h-screen w-full bg-[#F5F5DC] flex flex-col items-center justify-center p-4 fixed inset-0">
      {/* Todo List Title */}
      <h1 className="text-[#6B4694] text-4xl font-bold mb-8">Welcome to Todo List!</h1>

      {/* Register Card */}
      <div className="w-full max-w-md rounded-lg overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-[#E0B0FF] py-6 px-8">
          <h2 className="text-white text-2xl italic font-semibold text-center">
            Register Form
          </h2>
        </div>

        {/* Form */}
        <div className="bg-white p-8">
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Username Input */}
          <div className="flex items-center border border-gray-300 rounded mb-4">
            <div className="bg-[#E0B0FF] p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <input
              className="flex-1 p-3 outline-none text-gray-600"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email Input */}
          <div className="flex items-center border border-gray-300 rounded mb-4">
            <div className="bg-[#E0B0FF] p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <input
              className="flex-1 p-3 outline-none text-gray-600"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center border border-gray-300 rounded mb-4">
            <div className="bg-[#E0B0FF] p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </div>
            <input
              className="flex-1 p-3 outline-none text-gray-600"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password Input */}
          <div className="flex items-center border border-gray-300 rounded mb-2">
            <div className="bg-[#E0B0FF] p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </div>
            <input
              className="flex-1 p-3 outline-none text-gray-600"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Register Button */}
          <button
            onClick={register}
            className="bg-[#E0B0FF] text-white w-full py-3 rounded font-semibold hover:bg-[#D09FEF] transition-colors mt-4"
          >
            Register
          </button>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="text-[#9370DB] hover:underline bg-transparent border-none cursor-pointer font-semibold"
            >
              Login now
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;