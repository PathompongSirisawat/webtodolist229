import React, { useEffect, useState } from "react";
import API from "./api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function TodoPage() {

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  // ✅ โหลด todo ของ user ปัจจุบัน
  const fetchTodos = async () => {
    try {

      const me = await API.get("/users/me");

      const res = await API.get(
        `/todos?populate=users_permissions_user&filters[users_permissions_user][id][$eq]=${me.data.id}`
      );

      const mapped = res.data.data.map(item => ({
        id: item.id,
        documentId: item.documentId,
        title: item.title,
        dueDate: item.dueDate,
        priority: item.priority,
        completed: item.completed
      }));

      setTasks(mapped);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // ✅ เพิ่มงาน + ผูก user
  const addTask = async () => {

    if (!title || !deadline) return;

    try {

      const me = await API.get("/users/me");

      await API.post("/todos", {
        data: {
          title,
          dueDate: new Date(deadline).toISOString(),
          priority: 0,
          completed: false,
          users_permissions_user: me.data.id
        }
      });

      setTitle("");
      setDeadline("");

      fetchTodos();

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ toggle สถานะ
  const toggleDone = async (task) => {
    try {

      await API.put(`/todos/${task.documentId}`, {
        data: {
          completed: !task.completed
        }
      });

      setTasks(prev =>
        prev.map(t =>
          t.documentId === task.documentId
            ? { ...t, completed: !t.completed }
            : t
        )
      );

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ ลบงาน
  const deleteTask = async (task) => {
    try {

      await API.delete(`/todos/${task.documentId}`);

      setTasks(prev =>
        prev.filter(t => t.documentId !== task.documentId)
      );

    } catch (err) {
      console.error(err);
    }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const doneTasks = tasks.filter(t => t.completed);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(activeTasks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    const reordered = [...items, ...doneTasks];
    setTasks(reordered);
  };

  const getRemaining = (date) => {
    const diff = new Date(date) - new Date();
    if (diff <= 0) return "หมดเวลา";

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);

    return `${d}d ${h}h ${m}m`;
  };


  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8 space-y-8">

        <h1 className="text-4xl font-bold text-center text-gray-800">
          Todo List
        </h1>

        <div className="flex gap-3">
          <input
            className="flex-1 border rounded-xl p-3"
            placeholder="ชื่องาน"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="datetime-local"
            className="border rounded-xl p-3"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <button
            onClick={addTask}
            className="bg-blue-500 text-white px-6 rounded-xl"
          >
            เพิ่มงาน
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <table
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="w-full border rounded-xl overflow-hidden"
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">งาน</th>
                    <th className="p-3 text-left">กำหนดเวลา</th>
                    <th className="p-3 text-left">เวลาที่เหลือ</th>
                    <th className="p-3 text-left">สถานะ</th>
                    <th className="p-3 text-left">จัดการ</th>
                  </tr>
                </thead>

                <tbody>
                  {activeTasks.map((t, index) => (
                    <Draggable key={t.documentId} draggableId={t.documentId} index={index}>
                      {(provided) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="border-t"
                        >
                          <td className="p-3 break-words">{t.title}</td>
                          <td className="p-3">{new Date(t.dueDate).toLocaleString()}</td>
                          <td className="p-3">{getRemaining(t.dueDate)}</td>
                          <td className="p-3 text-yellow-600">ยังไม่เสร็จ</td>
                          <td className="p-3 space-x-2">
                            <button onClick={() => toggleDone(t)} className="bg-green-500 text-white px-3 py-1 rounded">
                              เสร็จ
                            </button>
                            <button onClick={() => deleteTask(t)} className="bg-gray-400 text-white px-3 py-1 rounded">
                              ลบ
                            </button>
                          </td>
                        </tr>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </tbody>
              </table>
            )}
          </Droppable>
        </DragDropContext>

        <div>
          <h2 className="text-xl font-bold mb-3 text-gray-700">
            งานที่เสร็จแล้ว
          </h2>

          <table className="w-full border rounded-xl overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">งาน</th>
                <th className="p-3 text-left">กำหนดเวลา</th>
                <th className="p-3 text-left">สถานะ</th>
                <th className="p-3 text-left">จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {doneTasks.map((t) => (
                <tr key={t.documentId} className="border-t">
                  <td className="p-3">{t.title}</td>
                  <td className="p-3">{new Date(t.dueDate).toLocaleString()}</td>
                  <td className="p-3 text-green-600 font-semibold">เสร็จแล้ว</td>
                  <td className="p-3 space-x-2">
                    <button onClick={() => toggleDone(t)} className="bg-red-500 text-white px-3 py-1 rounded">
                      ยกเลิก
                    </button>
                    <button onClick={() => deleteTask(t)} className="bg-gray-400 text-white px-3 py-1 rounded">
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}
