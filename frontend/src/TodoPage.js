import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function TodoPage() {

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!title || !deadline) return;

    setTasks(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title,
        deadline,
        done: false,
        alertedDay: false,
        alertedHour: false,
      },
    ]);

    setTitle("");
    setDeadline("");
  };

  const toggleDone = (id) => {
    setTasks(prev =>
      prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
    );
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const activeTasks = tasks.filter(t => !t.done);
  const doneTasks = tasks.filter(t => t.done);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(activeTasks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setTasks([...items, ...doneTasks]);
  };

  const getRemaining = (date) => {
    const diff = new Date(date) - new Date();
    if (diff <= 0) return "หมดเวลา";

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);

    return `${d}d ${h}h ${m}m`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev =>
        prev.map(task => {
          if (task.done) return task;

          const diff = new Date(task.deadline) - new Date();

          if (diff < 86400000 && !task.alertedDay) {
            alert(`ใกล้ถึงกำหนดภายใน 1 วัน: ${task.title}`);
            return { ...task, alertedDay: true };
          }

          if (diff < 3600000 && !task.alertedHour) {
            alert(`ใกล้ถึงกำหนดภายใน 1 ชั่วโมง: ${task.title}`);
            return { ...task, alertedHour: true };
          }

          return task;
        })
      );
    }, 60000);

    return () => clearInterval(interval);
  }, []);

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
                    <Draggable key={t.id} draggableId={t.id} index={index}>
                      {(provided) => (
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="border-t"
                        >
                          <td className="p-3 break-words">{t.title}</td>
                          <td className="p-3">{new Date(t.deadline).toLocaleString()}</td>
                          <td className="p-3">{getRemaining(t.deadline)}</td>
                          <td className="p-3 text-yellow-600">ยังไม่เสร็จ</td>
                          <td className="p-3 space-x-2">
                            <button onClick={() => toggleDone(t.id)} className="bg-green-500 text-white px-3 py-1 rounded">
                              เสร็จ
                            </button>
                            <button onClick={() => deleteTask(t.id)} className="bg-gray-400 text-white px-3 py-1 rounded">
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

          <div className="overflow-hidden rounded-xl border">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="p-3 text-left">งาน</th>
                  <th className="p-3 text-left">กำหนดเวลา</th>
                  <th className="p-3 text-left">สถานะ</th>
                  <th className="p-3 text-left">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {doneTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-3 break-words">{t.title}</td>

                    <td className="p-3">
                      {new Date(t.deadline).toLocaleString()}
                    </td>

                    <td className="p-3 text-green-600 font-semibold">
                      เสร็จแล้ว
                    </td>

                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => toggleDone(t.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                      >
                        ยกเลิก
                      </button>

                      <button
                        onClick={() => deleteTask(t.id)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-lg"
                      >
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

    </div>

  );
}
