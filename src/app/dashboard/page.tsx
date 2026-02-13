"use client";

import { useEffect, useMemo, useState } from "react";

type Creator = {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    instagram: string;
    category: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt?: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

function formatDate(iso?: string) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

export default function Dashboard() {
    const [rows, setRows] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState<Creator["status"]>("PENDING");
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState<Creator | null>(null);

    async function authCheck() {
        const res = await fetch(`${API}/auth/me`, { credentials: "include" });
        if (!res.ok) window.location.href = "/";
    }

    async function loadCreators(status: Creator["status"]) {
        setLoading(true);
        const res = await fetch(`${API}/admin/creators?status=${status}`, {
            cache: "no-store",
            credentials: "include",
        });
        const data = res.ok ? await res.json() : [];
        setRows(data);
        setSelected(data?.[0] ?? null);
        setLoading(false);
    }

    async function approve(id: string) {
        await fetch(`${API}/admin/creators/${id}/approve`, {
            method: "PATCH",
            credentials: "include",
        });
        await loadCreators(statusFilter);
    }

    async function reject(id: string) {
        await fetch(`${API}/admin/creators/${id}/reject`, {
            method: "PATCH",
            credentials: "include",
        });
        await loadCreators(statusFilter);
    }

    async function logout() {
        await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
        window.location.href = "/";
    }

    useEffect(() => {
        (async () => {
            await authCheck();
            await loadCreators("PENDING");
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadCreators(statusFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return rows;
        return rows.filter((c) => {
            return (
                c.name?.toLowerCase().includes(s) ||
                c.email?.toLowerCase().includes(s) ||
                c.instagram?.toLowerCase().includes(s) ||
                c.category?.toLowerCase().includes(s) ||
                (c.phoneNumber ?? "").toLowerCase().includes(s)
            );
        });
    }, [rows, q]);

    const pendingCount = statusFilter === "PENDING" ? rows.length : 0;
    const approvedCount = statusFilter === "APPROVED" ? rows.length : 0;
    const rejectedCount = statusFilter === "REJECTED" ? rows.length : 0;

    return (
        <main className="min-h-screen bg-[#05050b] text-white">
            {/* TOP BAR */}
            <header className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur">
                <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black">
                            DT
                        </div>
                        <div>
                            <div className="font-extrabold tracking-wide">
                                <span className="text-[#0ea5a6]">Digi</span>
                                <span className="text-[#f15a2b]">Tag</span>{" "}
                                <span className="text-white/60 font-semibold">Admin</span>
                            </div>
                            <div className="text-xs text-white/60">Creator approvals & verification</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                            Secure session
                        </span>
                        <button
                            onClick={logout}
                            className="rounded-xl border border-white/10 px-4 py-2 hover:bg-white/10 text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-6">
                {/* STATS + CONTROLS */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="text-sm text-white/60">Pending</div>
                        <div className="mt-1 text-3xl font-extrabold">{pendingCount}</div>
                        <div className="mt-2 text-xs text-white/50">Creators awaiting approval</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="text-sm text-white/60">Approved</div>
                        <div className="mt-1 text-3xl font-extrabold">{approvedCount}</div>
                        <div className="mt-2 text-xs text-white/50">Live creators</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="text-sm text-white/60">Rejected</div>
                        <div className="mt-1 text-3xl font-extrabold">{rejectedCount}</div>
                        <div className="mt-2 text-xs text-white/50">Rejected applications</div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setStatusFilter("PENDING")}
                            className={`rounded-xl px-4 py-2 text-sm border ${statusFilter === "PENDING"
                                    ? "bg-white text-black border-white"
                                    : "border-white/10 hover:bg-white/10"
                                }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setStatusFilter("APPROVED")}
                            className={`rounded-xl px-4 py-2 text-sm border ${statusFilter === "APPROVED"
                                    ? "bg-white text-black border-white"
                                    : "border-white/10 hover:bg-white/10"
                                }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setStatusFilter("REJECTED")}
                            className={`rounded-xl px-4 py-2 text-sm border ${statusFilter === "REJECTED"
                                    ? "bg-white text-black border-white"
                                    : "border-white/10 hover:bg-white/10"
                                }`}
                        >
                            Rejected
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search name, email, phone, category…"
                            className="w-full md:w-80 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm outline-none focus:border-white/30"
                        />
                    </div>
                </div>

                {/* MAIN LAYOUT */}
                <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                    {/* TABLE */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                            <div className="font-bold">
                                {statusFilter === "PENDING"
                                    ? "Pending applications"
                                    : statusFilter === "APPROVED"
                                        ? "Approved creators"
                                        : "Rejected creators"}
                            </div>
                            <div className="text-xs text-white/60">
                                Showing <span className="text-white">{filtered.length}</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-6 text-white/70">Loading…</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-6 text-white/70">No records.</div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-white/60">
                                        <tr className="border-b border-white/10">
                                            <th className="text-left px-5 py-3 font-medium">Creator</th>
                                            <th className="text-left px-5 py-3 font-medium">Category</th>
                                            <th className="text-left px-5 py-3 font-medium">Contact</th>
                                            <th className="text-right px-5 py-3 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((c) => (
                                            <tr
                                                key={c.id}
                                                onClick={() => setSelected(c)}
                                                className={`border-b border-white/10 cursor-pointer hover:bg-white/10 ${selected?.id === c.id ? "bg-white/10" : ""
                                                    }`}
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold">{c.name}</div>
                                                    <div className="text-xs text-white/60">{formatDate(c.createdAt)}</div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">
                                                        {c.category}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="text-white/80">{c.email}</div>
                                                    <div className="text-xs text-white/60">{c.phoneNumber ?? "-"}</div>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    {statusFilter === "PENDING" ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    approve(c.id);
                                                                }}
                                                                className="rounded-xl bg-white text-black px-3 py-2 font-semibold hover:opacity-90"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    reject(c.id);
                                                                }}
                                                                className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/10"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-white/60">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* DETAILS PANEL */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center justify-between">
                            <div className="font-bold">Creator details</div>
                            {selected?.status && (
                                <span className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                                    {selected.status}
                                </span>
                            )}
                        </div>

                        {!selected ? (
                            <div className="mt-4 text-white/70">Select a creator from the list.</div>
                        ) : (
                            <div className="mt-4 grid gap-3 text-sm">
                                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                    <div className="text-white/60 text-xs">Name</div>
                                    <div className="font-semibold">{selected.name}</div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                    <div className="text-white/60 text-xs">Category</div>
                                    <div className="font-semibold">{selected.category}</div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                    <div className="text-white/60 text-xs">Email</div>
                                    <div className="font-semibold break-all">{selected.email}</div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                    <div className="text-white/60 text-xs">Phone</div>
                                    <div className="font-semibold">{selected.phoneNumber ?? "-"}</div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                    <div className="text-white/60 text-xs">Instagram</div>
                                    <div className="font-semibold break-all">{selected.instagram}</div>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                    <div className="text-white/60 text-xs">Applied at</div>
                                    <div className="font-semibold">{formatDate(selected.createdAt)}</div>
                                </div>

                                {selected.status === "PENDING" && (
                                    <div className="mt-2 flex gap-2">
                                        <button
                                            onClick={() => approve(selected.id)}
                                            className="flex-1 rounded-xl bg-white text-black px-4 py-3 font-semibold hover:opacity-90"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => reject(selected.id)}
                                            className="flex-1 rounded-xl border border-white/10 px-4 py-3 hover:bg-white/10"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 text-xs text-white/50">
                    Tip: Click a row to open details. Approve/Reject updates the list.
                </div>
            </div>
        </main>
    );
}
