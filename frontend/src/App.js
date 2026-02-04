import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import TodoPage from "./TodoPage";
import { isLoggedIn, logout } from "./auth";

function App() {
  const [auth, setAuth] = useState(isLoggedIn());
  const [mode, setMode] = useState("login");

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md">
          {mode === "login" ? (
            <>
              <Login onSuccess={() => setAuth(true)} />
              <p
                className="text-center mt-4 text-blue-500 cursor-pointer"
                onClick={() => setMode("register")}
              >
                ยังไม่มีบัญชี? สมัครสมาชิก
              </p>
            </>
          ) : (
            <>
              <Register onSuccess={() => setAuth(true)} />
              <p
                className="text-center mt-4 text-blue-500 cursor-pointer"
                onClick={() => setMode("login")}
              >
                มีบัญชีแล้ว? เข้าสู่ระบบ
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ปุ่ม logout */}
      <div className="p-4 text-right bg-gray-100">
        <button
          onClick={() => {
            logout();
            setAuth(false);
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <TodoPage />
    </>
  );
}

export default App;
