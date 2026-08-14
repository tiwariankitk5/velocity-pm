"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";

type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: string;
};

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

export default function KanbanBoard() {
  const { id: projectId } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const res = await api<{ data: Task[] }>(`/api/tasks/project/${projectId}`);
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [projectId]);

  async function handleDrop(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;

    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks(ts => ts.map(t => t.id === taskId ? { ...t, status } : t));

    try {
      await api(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
    } catch (err) {
      alert("Failed to move task");
      setTasks(previousTasks); // Rollback
    }
  }

  if (loading) return <div className="p-8">Loading board...</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-mist">
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold">Project Board</h1>
        <button className="rounded bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90 transition-colors">
          New Task
        </button>
      </header>
      
      <div className="flex flex-1 gap-4 overflow-x-auto p-6 pb-8">
        {COLUMNS.map(col => (
          <div 
            key={col.id} 
            className="flex w-80 shrink-0 flex-col rounded-lg bg-black/5 p-3"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, col.id)}
          >
            <h2 className="mb-3 px-2 font-semibold text-black/70 flex items-center justify-between">
              {col.label}
              <span className="text-xs bg-black/10 rounded-full px-2 py-0.5">{tasks.filter(t => t.status === col.id).length}</span>
            </h2>
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto min-h-[100px]">
              {tasks.filter(t => t.status === col.id).map(task => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData("text/plain", task.id)}
                  className="cursor-grab rounded bg-white p-3 shadow-sm border border-black/5 active:cursor-grabbing hover:border-black/20 transition-colors"
                >
                  <div className="font-medium">{task.title}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded bg-black/5 px-2 py-1 text-xs font-medium uppercase text-black/60">
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
