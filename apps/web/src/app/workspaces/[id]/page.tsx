"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Users, UserPlus, Settings, LayoutDashboard } from "lucide-react";
import { api } from "@/lib/api";

type Member = { user: { _id: string; name: string; email: string }; role: string; joinedAt: string };

export default function WorkspacePage() {
  const { id } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api<{ data: Member[] }>(`/api/workspaces/${id}/members`);
        setMembers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await api(`/api/workspaces/${id}/invitations`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail, role: "member" })
      });
      alert("Invitation sent!");
      setInviteEmail("");
    } catch (err: any) {
      alert(err.message || "Failed to invite");
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Are you sure?")) return;
    try {
      await api(`/api/workspaces/${id}/members/${memberId}`, { method: "DELETE" });
      setMembers(m => m.filter(x => x.user._id !== memberId));
    } catch (err: any) {
      alert(err.message || "Failed to remove member");
    }
  }

  if (loading) return <div className="p-8">Loading workspace...</div>;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4 border-black/10">
        <div>
          <h1 className="text-3xl font-bold">Workspace Settings</h1>
          <p className="text-black/60">Manage members and workspace configuration.</p>
        </div>
      </header>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold flex items-center gap-2"><UserPlus size={20}/> Invite Members</h2>
        <form onSubmit={handleInvite} className="flex max-w-md gap-3">
          <input 
            type="email" 
            placeholder="colleague@example.com" 
            required 
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="w-full rounded border border-black/20 px-3 py-2 outline-none focus:border-black/50" 
          />
          <button className="rounded bg-ink px-4 py-2 font-medium text-white transition-colors hover:bg-ink/90">Invite</button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold flex items-center gap-2"><Users size={20}/> Members Directory</h2>
        <div className="rounded-lg border border-black/10 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {members.map(m => (
                <tr key={m.user._id} className="transition-colors hover:bg-black/5">
                  <td className="px-4 py-3">
                    <div className="font-medium">{m.user.name}</div>
                    <div className="text-black/50">{m.user.email}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    <span className="rounded-full bg-black/10 px-2 py-1 text-xs font-semibold">{m.role}</span>
                  </td>
                  <td className="px-4 py-3 text-black/60">{new Date(m.joinedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {m.role !== "owner" && (
                      <button onClick={() => handleRemoveMember(m.user._id)} className="text-coral hover:underline font-medium">Remove</button>
                    )}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-black/50">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
