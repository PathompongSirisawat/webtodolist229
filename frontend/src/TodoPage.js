import React, { useEffect, useState } from "react";
import API from "./api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function TodoPage() {

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auto-update time every 1 minute for Active Tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(interval);
  }, []);

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
    const diff = new Date(date) - currentTime;
    if (diff <= 0) return "หมดเวลา";

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);

    return `${d}d ${h}h ${m}m`;
  };

  // Calculate how early the task was completed (for completed tasks)
  const getCompletionTime = (dueDate) => {
    const now = new Date();
    const deadline = new Date(dueDate);
    const diff = deadline - now; // positive = completed before deadline

    if (diff > 0) {
      // Completed before deadline
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      
      return `เร็วกว่า ${d}d ${h}h ${m}m`;
    } else {
      // Completed after deadline
      const absDiff = Math.abs(diff);
      const d = Math.floor(absDiff / 86400000);
      const h = Math.floor((absDiff / 3600000) % 24);
      const m = Math.floor((absDiff / 60000) % 60);
      
      return `ช้ากว่า ${d}d ${h}h ${m}m`;
    }
  };


  return (
    <div className="min-h-screen bg-[#F5F5DC] p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-[#6B4694] mb-2">
            My Todo List
          </h1>
          <p className="text-gray-600 text-lg">Organize your tasks beautifully</p>
        </div>

        {/* Add Task Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-[#E0B0FF] py-4 px-6">
            <h2 className="text-white text-xl font-semibold">Add New Task</h2>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-[#E0B0FF] transition-colors">
                  <div className="bg-[#E0B0FF] p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                    </svg>
                  </div>
                  <input
                    className="flex-1 p-3 outline-none text-gray-700"
                    placeholder="ชื่องาน"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-[#E0B0FF] transition-colors">
                  <div className="bg-[#E0B0FF] p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                  </div>
                  <input
                    type="datetime-local"
                    className="flex-1 p-3 outline-none text-gray-700"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={addTask}
                className="bg-[#E0B0FF] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#D09FEF] transition-colors shadow-md"
              >
                เพิ่มงาน
              </button>
            </div>
          </div>
        </div>

        {/* Active Tasks Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-[#E0B0FF] py-4 px-6 flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">Active Tasks</h2>
            <span className="bg-white text-[#6B4694] px-3 py-1 rounded-full text-sm font-bold">
              {activeTasks.length} tasks
            </span>
          </div>

          <div className="overflow-x-auto">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <table
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="w-full"
                  >
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="p-4 text-left text-[#6B4694] font-semibold">งาน</th>
                        <th className="p-4 text-left text-[#6B4694] font-semibold">กำหนดเวลา</th>
                        <th className="p-4 text-left text-[#6B4694] font-semibold">เวลาที่เหลือ</th>
                        <th className="p-4 text-left text-[#6B4694] font-semibold">สถานะ</th>
                        <th className="p-4 text-left text-[#6B4694] font-semibold">จัดการ</th>
                      </tr>
                    </thead>

                    <tbody>
                      {activeTasks.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-gray-400">
                            <div className="flex flex-col items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-2 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                              </svg>
                              <p className="text-lg">ไม่มีงานที่ต้องทำ</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        activeTasks.map((t, index) => (
                          <Draggable key={t.documentId} draggableId={t.documentId} index={index}>
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`border-b border-gray-100 hover:bg-purple-50 transition-colors ${snapshot.isDragging ? 'bg-purple-100 shadow-lg' : ''}`}
                              >
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="text-gray-400">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                      </svg>
                                    </div>
                                    <span className="text-gray-800 font-medium">{t.title}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-gray-600">
                                  {new Date(t.dueDate).toLocaleString('th-TH', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                                <td className="p-4">
                                  <span className={`font-semibold ${
                                    getRemaining(t.dueDate) === "หมดเวลา" 
                                      ? "text-red-600" 
                                      : "text-amber-600"
                                  }`}>
                                    {getRemaining(t.dueDate)}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                                    ยังไม่เสร็จ
                                  </span>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => toggleDone(t)} 
                                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-sm font-medium"
                                    >
                                      ✓ เสร็จ
                                    </button>
                                    <button 
                                      onClick={() => deleteTask(t)} 
                                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors shadow-sm font-medium"
                                    >
                                      ลบ
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </tbody>
                  </table>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Completed Tasks Section */}
        {doneTasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#a4ebc3] py-4 px-6 flex items-center justify-between">
              <h2 className="text-white text-xl font-semibold">Completed Tasks</h2>
              <span className="bg-white text-[#5FAD5F] px-3 py-1 rounded-full text-sm font-bold">
                {doneTasks.length} done
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="p-4 text-left text-[#6B4694] font-semibold">งาน</th>
                    <th className="p-4 text-left text-[#6B4694] font-semibold">กำหนดเวลา</th>
                    <th className="p-4 text-left text-[#6B4694] font-semibold">เวลาที่เสร็จสิ้น</th>
                    <th className="p-4 text-left text-[#6B4694] font-semibold">สถานะ</th>
                    <th className="p-4 text-left text-[#6B4694] font-semibold">จัดการ</th>
                  </tr>
                </thead>

                <tbody>
                  {doneTasks.map((t) => (
                    <tr key={t.documentId} className="border-b border-gray-100 hover:bg-[#F0F9F0] transition-colors">
                      <td className="p-4">
                        <span className="text-gray-500 line-through">{t.title}</span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(t.dueDate).toLocaleString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-[#5FAD5F]">
                          {getCompletionTime(t.dueDate)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#AEDCAE] text-white">
                          ✓ เสร็จแล้ว
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => toggleDone(t)} 
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-sm font-medium"
                          >
                            ยกเลิก
                          </button>
                          <button 
                            onClick={() => deleteTask(t)} 
                            className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors shadow-sm font-medium"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}