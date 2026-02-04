import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:1337/api/todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [now, setNow] = useState(new Date());

  // update เวลา ทุก 1 นาที
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchTodos = async () => {
    const res = await axios.get(API_URL);
    const data = res.data.data || [];

    data.sort(
      (a, b) =>
        new Date(a.dueDate || 0) -
        new Date(b.dueDate || 0)
    );

    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!title || !dueDate) return;

    await axios.post(API_URL, {
      data: {
        title,
        dueDate,
        completed: false,
      },
    });

    setTitle("");
    setDueDate("");
    fetchTodos();
  };

  const toggleComplete = async (todo) => {
    await axios.put(`${API_URL}/${todo.documentId}`, {
      data: {
        completed: !todo.completed,
      },
    });

    fetchTodos();
  };

  const deleteTodo = async (todo) => {
    await axios.delete(`${API_URL}/${todo.documentId}`);
    fetchTodos();
  };

  // คำนวณเวลาที่เหลือ
  const getRemaining = (dueDate) => {
    const diff =
      new Date(dueDate) - now;

    if (diff <= 0) return "เลยกำหนด";

    const totalMin = Math.floor(diff / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;

    return `เหลือ ${h}h ${m}m`;
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📋 Todo List ของฉัน
      </h1>

      {/* input */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <input
          className="border p-2 rounded"
          placeholder="ชื่องาน"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="border p-2 rounded"
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <button
          onClick={addTodo}
          className="bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          เพิ่ม Todo list
        </button>
      </div>

      {/* header */}
      <div className="grid grid-cols-5 font-bold border-b pb-2 mb-2">
        <div>งาน</div>
        <div>กำหนดเวลา</div>
        <div>สถานะ</div>
        <div>เวลาที่เหลือ</div>
        <div className="text-center">จัดการ</div>
      </div>

      {todos.map((todo) => (
        <div
          key={todo.documentId}
          className="grid grid-cols-5 items-center border-b py-3"
        >
          {/* ชื่องาน wrap */}
          <div className="break-words whitespace-pre-wrap">
            {todo.title}
          </div>

          <div>
            {new Date(
              todo.dueDate
            ).toLocaleString()}
          </div>

          <div>
            {todo.completed
              ? "✅ เสร็จแล้ว"
              : "⏳ ยังไม่เสร็จ"}
          </div>

          <div
            className={
              getRemaining(todo.dueDate) ===
              "เลยกำหนด"
                ? "text-red-500"
                : "text-gray-700"
            }
          >
            {getRemaining(todo.dueDate)}
          </div>

          <div className="flex gap-2 justify-center">
            <button
              onClick={() =>
                toggleComplete(todo)
              }
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              เสร็จ
            </button>

            <button
              onClick={() =>
                deleteTodo(todo)
              }
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              ลบ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
