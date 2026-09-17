"use client";

import { useState } from "react";
import { Activity, Bell, Bot, CalendarDays, CheckCircle2, Clock3, Filter, LayoutDashboard, MessageSquare, Plus, Search, Settings, Users, X, type LucideIcon } from "lucide-react";

const stats: Array<[string, string, string, LucideIcon]> = [
  ["Completed", "128", "+18%", CheckCircle2],
  ["Pending", "42", "12 urgent", Clock3],
  ["Team focus", "86%", "+6%", Activity],
  ["Sprint days", "9", "left", CalendarDays]
];

const columns = [
  {
    title: "Backlog",
    tasks: [
      { title: "Design invitation acceptance flow", priority: "High", owner: "AK" },
      { title: "Add audit log model", priority: "Medium", owner: "SM" }
    ]
  },
  {
    title: "In Progress",
    tasks: [
      { title: "JWT refresh token rotation", priority: "Urgent", owner: "NP" },
      { title: "Workspace analytics cards", priority: "High", owner: "AK" }
    ]
  },
  {
    title: "Review",
    tasks: [{ title: "Socket presence channel", priority: "Medium", owner: "JR" }]
  },
  {
    title: "Done",
    tasks: [{ title: "Project CRUD endpoints", priority: "Low", owner: "AK" }]
  }
];

export default function HomePage() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "JWT refresh token rotation moved to Review", detail: "Nikhil updated the task · 4m ago", unread: true, tone: "bg-grape" },
    { id: 2, title: "You were mentioned in Workspace analytics cards", detail: "Ankit left a comment · 18m ago", unread: true, tone: "bg-teal" },
    { id: 3, title: "Sprint 12 is due in 9 days", detail: "Project ATLAS · Today", unread: false, tone: "bg-coral" }
  ]);
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  return (
    <main className="min-h-screen bg-mist text-ink">
      <aside className="fixed left-0 top-0 hidden h-screen w-20 border-r border-black/10 bg-white lg:flex lg:flex-col lg:items-center lg:py-5">
        <div className="mb-8 grid h-11 w-11 place-items-center rounded bg-ink text-sm font-bold text-white">V</div>
        <nav className="flex flex-1 flex-col gap-3">
          {[LayoutDashboard, CheckCircle2, MessageSquare, CalendarDays, Users, Settings].map((Icon, index) => (
            <button key={index} className="focus-ring grid h-11 w-11 place-items-center rounded text-black/65 hover:bg-black/5" title={Icon.name}>
              <Icon size={20} />
            </button>
          ))}
        </nav>
      </aside>

      <section className="lg:pl-20">
        <header className="sticky top-0 z-20 border-b border-black/10 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal">Workspace</p>
              <h1 className="text-xl font-semibold md:text-2xl">Velocity Product Team</h1>
            </div>
            <div className="hidden min-w-80 items-center gap-2 rounded border border-black/10 bg-mist px-3 py-2 md:flex">
              <Search size={18} className="text-black/45" />
              <input className="w-full bg-transparent text-sm outline-none" placeholder="Search tasks, docs, people" />
            </div>
            <div className="relative flex items-center gap-2">
              <button onClick={() => setNotificationsOpen((open) => !open)} className="focus-ring relative grid h-10 w-10 place-items-center rounded border border-black/10 bg-white" title="Notifications" aria-label={`Notifications, ${unreadCount} unread`} aria-expanded={notificationsOpen}><Bell size={18} />{unreadCount > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{unreadCount}</span>}</button>
              {notificationsOpen && <section className="absolute right-0 top-12 z-30 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded border border-black/10 bg-white shadow-xl" aria-label="Notification center">
                <div className="flex items-center justify-between border-b border-black/10 px-4 py-3"><div><h2 className="font-semibold">Notifications</h2><p className="text-xs text-black/55">{unreadCount ? `${unreadCount} new updates` : "You are all caught up"}</p></div><button onClick={() => setNotificationsOpen(false)} className="focus-ring grid h-8 w-8 place-items-center rounded hover:bg-black/5" aria-label="Close notifications"><X size={17} /></button></div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => <button key={notification.id} onClick={() => setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, unread: false } : item))} className={`flex w-full gap-3 border-b border-black/5 px-4 py-3 text-left transition hover:bg-mist ${notification.unread ? "bg-grape/5" : ""}`}><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${notification.tone}`} /><span><strong className="block text-sm leading-5">{notification.title}</strong><span className="mt-1 block text-xs text-black/55">{notification.detail}</span></span>{notification.unread && <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-grape" />}</button>)}
                </div>
                <button onClick={() => setNotifications((items) => items.map((item) => ({ ...item, unread: false })))} className="focus-ring w-full bg-mist px-4 py-3 text-sm font-semibold text-teal hover:bg-teal/10">Mark all as read</button>
              </section>}
              <button className="focus-ring inline-flex h-10 items-center gap-2 rounded bg-ink px-3 text-sm font-semibold text-white"><Plus size={17} /> Task</button>
            </div>
          </div>
        </header>

        <div className="grid gap-4 px-4 py-5 md:px-6 xl:grid-cols-[1fr_340px]">
          <section className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              {stats.map(([label, value, delta, Icon]) => (
                <article key={label} className="rounded border border-black/10 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between"><p className="text-sm text-black/55">{label}</p><Icon size={18} className="text-teal" /></div>
                  <div className="flex items-end justify-between"><strong className="text-2xl">{value}</strong><span className="text-xs font-medium text-black/55">{delta}</span></div>
                </article>
              ))}
            </div>

            <div className="rounded border border-black/10 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 p-4">
                <div>
                  <h2 className="text-lg font-semibold">Sprint Board</h2>
                  <p className="text-sm text-black/55">Realtime Kanban for Project ATLAS</p>
                </div>
                <div className="flex gap-2">
                  <button className="focus-ring grid h-9 w-9 place-items-center rounded border border-black/10" title="Filter"><Filter size={17} /></button>
                  <button className="focus-ring rounded border border-black/10 px-3 text-sm font-medium">Sprint 12</button>
                </div>
              </div>

              <div className="grid gap-3 overflow-x-auto p-4 md:grid-cols-4">
                {columns.map((column) => (
                  <div key={column.title} className="min-w-64 rounded bg-mist p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold">{column.title}</h3>
                      <span className="rounded bg-white px-2 py-1 text-xs font-semibold">{column.tasks.length}</span>
                    </div>
                    <div className="space-y-3">
                      {column.tasks.map((task) => (
                        <article key={task.title} className="rounded border border-black/10 bg-white p-3 shadow-sm">
                          <p className="mb-3 text-sm font-semibold leading-5">{task.title}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="rounded bg-coral/10 px-2 py-1 font-semibold text-coral">{task.priority}</span>
                            <span className="grid h-7 w-7 place-items-center rounded bg-ink text-[11px] font-bold text-white">{task.owner}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded border border-black/10 bg-white p-4">
              <div className="mb-3 flex items-center gap-2"><Bot size={19} className="text-grape" /><h2 className="font-semibold">AI Project Copilot</h2></div>
              <p className="mb-4 text-sm leading-6 text-black/65">Sprint risk is moderate. Refresh token rotation and analytics cards are blocking the release candidate.</p>
              <button className="focus-ring w-full rounded bg-grape px-3 py-2 text-sm font-semibold text-white">Generate sprint plan</button>
            </section>

            <section className="rounded border border-black/10 bg-white p-4">
              <div className="mb-3 flex items-center gap-2"><MessageSquare size={19} className="text-teal" /><h2 className="font-semibold">Team Chat</h2></div>
              <div className="space-y-3 text-sm">
                <p><strong>Ankit:</strong> API routes are ready for board sync.</p>
                <p><strong>Neha:</strong> I will test role permissions today.</p>
                <p><strong>Jay:</strong> Presence events are live locally.</p>
              </div>
            </section>

            <section className="rounded border border-black/10 bg-white p-4">
              <div className="mb-3 flex items-center gap-2"><Users size={19} className="text-coral" /><h2 className="font-semibold">Members Online</h2></div>
              <div className="flex -space-x-2">
                {["AK", "NP", "SM", "JR"].map((name) => <span key={name} className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-ink text-xs font-bold text-white">{name}</span>)}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

