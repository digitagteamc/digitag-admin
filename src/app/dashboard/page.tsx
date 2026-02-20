"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "PENDING" | "APPROVED" | "REJECTED";
type Entity = "CREATORS" | "BRANDS";

type Creator = {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    location?: string;
    creatorName?: string;
    industry?: string;
    adsPreference?: string;
    primaryPlatform?: string;
    socialLinks?: Record<string, string>;
    followerCount?: number;
    profilePicture?: string;
    bio?: string;
    collaborationInterests?: string;
    state?: string;
    district?: string;
    language?: string;
    uniqueKey?: string;
    status: Status;
    createdAt?: string;

    instagram?: string; // legacy
    category?: string;  // legacy
};

type Brand = {
    id: string;
    userId?: string;
    phoneNumber: string;
    brandName: string;
    pan: string;
    gstin?: string | null;
    city?: string | null;
    state?: string | null;
    status: Status;
    createdAt?: string;
};

type Row = Creator | Brand;


function formatDate(iso?: string) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

function isBrand(r: Row): r is Brand {
    return (r as any).brandName !== undefined;
}

export default function Dashboard() {
    const [entity, setEntity] = useState<Entity>("CREATORS");

    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState<Status>("PENDING");
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState<Row | null>(null);

    function basePath() {
        return entity === "CREATORS" ? "admin/creators" : "admin/brands";
    }

    async function authCheck() {
        // keep your existing check
        const res = await fetch("/api/auth/me");
        if (!res.ok) window.location.href = "/";
    }

    async function loadRows(status: Status) {
        setLoading(true);
        const res = await fetch(`/api/${basePath()}?status=${status}`, {
            cache: "no-store",
        });
        const data = res.ok ? await res.json() : [];
        setRows(data);
        setSelected(data?.[0] ?? null);
        setLoading(false);
    }

    async function approve(id: string) {
        await fetch(`/api/${basePath()}/${id}/approve`, {
            method: "PATCH",
        });
        await loadRows(statusFilter);
    }

    async function reject(id: string) {
        await fetch(`/api/${basePath()}/${id}/reject`, {
            method: "PATCH",
        });
        await loadRows(statusFilter);
    }

    async function logout() {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
    }

    useEffect(() => {
        (async () => {
            await authCheck();
            await loadRows("PENDING");
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadRows(statusFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, entity]);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return rows;

        return rows.filter((r) => {
            if (isBrand(r)) {
                return (
                    r.brandName?.toLowerCase().includes(s) ||
                    r.pan?.toLowerCase().includes(s) ||
                    (r.gstin ?? "").toLowerCase().includes(s) ||
                    (r.city ?? "").toLowerCase().includes(s) ||
                    (r.state ?? "").toLowerCase().includes(s) ||
                    (r.phoneNumber ?? "").toLowerCase().includes(s)
                );
            }

            return (
                r.name?.toLowerCase().includes(s) ||
                r.email?.toLowerCase().includes(s) ||
                r.instagram?.toLowerCase().includes(s) ||
                r.category?.toLowerCase().includes(s) ||
                (r.phoneNumber ?? "").toLowerCase().includes(s) ||
                (r.uniqueKey ?? "").toLowerCase().includes(s) ||
                (r.creatorName ?? "").toLowerCase().includes(s)
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
                            <div className="text-xs text-white/60">
                                Approvals • Creators & Brands
                            </div>
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
                {/* ENTITY TOGGLE + STATS */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setEntity("CREATORS")}
                            className={`rounded-xl px-4 py-2 text-sm border ${entity === "CREATORS"
                                ? "bg-white text-black border-white"
                                : "border-white/10 hover:bg-white/10"
                                }`}
                        >
                            Creators
                        </button>
                        <button
                            onClick={() => setEntity("BRANDS")}
                            className={`rounded-xl px-4 py-2 text-sm border ${entity === "BRANDS"
                                ? "bg-white text-black border-white"
                                : "border-white/10 hover:bg-white/10"
                                }`}
                        >
                            Brands
                        </button>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3 w-full lg:w-auto">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="text-sm text-white/60">Pending</div>
                            <div className="mt-1 text-3xl font-extrabold">{pendingCount}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="text-sm text-white/60">Approved</div>
                            <div className="mt-1 text-3xl font-extrabold">{approvedCount}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="text-sm text-white/60">Rejected</div>
                            <div className="mt-1 text-3xl font-extrabold">{rejectedCount}</div>
                        </div>
                    </div>
                </div>

                {/* FILTERS */}
                <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        {(["PENDING", "APPROVED", "REJECTED"] as Status[]).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`rounded-xl px-4 py-2 text-sm border ${statusFilter === s
                                    ? "bg-white text-black border-white"
                                    : "border-white/10 hover:bg-white/10"
                                    }`}
                            >
                                {s[0] + s.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={`Search ${entity === "CREATORS"
                            ? "name, email, phone, category…"
                            : "brand, PAN, GSTIN, city, phone…"
                            }`}
                        className="w-full md:w-80 rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm outline-none focus:border-white/30"
                    />
                </div>

                {/* MAIN LAYOUT */}
                <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                    {/* TABLE */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                            <div className="font-bold">
                                {entity === "CREATORS" ? "Creators" : "Brands"} •{" "}
                                {statusFilter.toLowerCase()}
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
                                            <th className="text-left px-5 py-3 font-medium">
                                                {entity === "CREATORS" ? "Creator" : "Brand"}
                                            </th>
                                            <th className="text-left px-5 py-3 font-medium">
                                                {entity === "CREATORS" ? "Category" : "Location"}
                                            </th>
                                            <th className="text-left px-5 py-3 font-medium">
                                                {entity === "CREATORS" ? "Contact" : "PAN / Phone"}
                                            </th>
                                            <th className="text-right px-5 py-3 font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((r) => (
                                            <tr
                                                key={r.id}
                                                onClick={() => setSelected(r)}
                                                className={`border-b border-white/10 cursor-pointer hover:bg-white/10 ${selected?.id === r.id ? "bg-white/10" : ""
                                                    }`}
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold">
                                                        {isBrand(r) ? r.brandName : r.name}
                                                    </div>
                                                    <div className="text-xs text-white/60">
                                                        {formatDate(r.createdAt)}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">
                                                        {isBrand(r)
                                                            ? `${r.city ?? "-"}, ${r.state ?? "-"}`
                                                            : r.category}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <div className="text-white/80">
                                                        {isBrand(r) ? r.pan : r.email}
                                                    </div>
                                                    <div className="text-xs text-white/60">
                                                        {r.phoneNumber ?? "-"}
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-right">
                                                    {statusFilter === "PENDING" ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    approve(r.id);
                                                                }}
                                                                className="rounded-xl bg-white text-black px-3 py-2 font-semibold hover:opacity-90"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    reject(r.id);
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
                            <div className="font-bold">
                                {entity === "CREATORS" ? "Creator details" : "Brand details"}
                            </div>
                            {selected?.status && (
                                <span className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                                    {selected.status}
                                </span>
                            )}
                        </div>

                        {!selected ? (
                            <div className="mt-4 text-white/70">Select a row from the list.</div>
                        ) : isBrand(selected) ? (
                            <div className="mt-4 grid gap-3 text-sm">
                                {[
                                    ["Brand Name", selected.brandName],
                                    ["Phone", selected.phoneNumber],
                                    ["PAN", selected.pan],
                                    ["GSTIN", selected.gstin ?? "-"],
                                    ["City", selected.city ?? "-"],
                                    ["State", selected.state ?? "-"],
                                    ["Applied at", formatDate(selected.createdAt)],
                                ].map(([k, v]) => (
                                    <div key={k} className="rounded-xl border border-white/10 bg-black/20 p-4">
                                        <div className="text-white/60 text-xs">{k}</div>
                                        <div className="font-semibold break-all">{v}</div>
                                    </div>
                                ))}

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
                        ) : (
                            <div className="mt-4 flex flex-col gap-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
                                {/* Unique Key Section */}
                                <div className="rounded-2xl border border-[#0ea5a6]/30 bg-[#0ea5a6]/5 p-5 border-dashed">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#0ea5a6]/60">Unique Creator ID</div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <div className="text-2xl font-black text-[#0ea5a6]">{selected.uniqueKey || "N/A"}</div>
                                    </div>
                                </div>

                                {/* Main Info Section */}
                                <div className="grid gap-3">
                                    <div className="flex items-center gap-3">
                                        {selected.profilePicture && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={selected.profilePicture}
                                                alt={selected.name}
                                                className="h-16 w-16 rounded-2xl object-cover border border-white/10"
                                            />
                                        )}
                                        <div>
                                            <div className="text-lg font-bold">{selected.name}</div>
                                            <div className="text-xs text-white/50">{selected.email}</div>
                                        </div>
                                    </div>

                                    {[
                                        ["Stage Name", selected.creatorName || "-"],
                                        ["Industry", selected.industry || selected.category || "-"],
                                        ["Location", selected.location || "-"],
                                        ["State / District", `${selected.state || "-"} / ${selected.district || "-"}`],
                                        ["Language", selected.language || "-"],
                                        ["Status", selected.status],
                                        ["Applied at", formatDate(selected.createdAt)],
                                    ].map(([k, v]) => (
                                        <div key={k} className="rounded-xl border border-white/10 bg-black/20 p-3">
                                            <div className="text-white/40 text-[10px] font-bold uppercase tracking-tight">{k}</div>
                                            <div className="font-medium text-white/90">{v}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Social Presence Section */}
                                <div className="grid gap-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Social Presence</label>
                                    {[
                                        ["Primary Platform", selected.primaryPlatform || "-"],
                                        ["Follower Count", selected.followerCount?.toLocaleString() || "0"],
                                        ["Ads Preference", selected.adsPreference || "-"],
                                    ].map(([k, v]) => (
                                        <div key={k} className="rounded-xl border border-white/10 bg-black/20 p-3">
                                            <div className="text-white/40 text-[10px] font-bold uppercase tracking-tight">{k}</div>
                                            <div className="font-medium text-white/90">{v}</div>
                                        </div>
                                    ))}

                                    {/* Dynamic Social Links */}
                                    {selected.socialLinks && Object.keys(selected.socialLinks || {}).length > 0 && (
                                        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                            <div className="text-white/40 text-[10px] font-bold uppercase tracking-tight mb-3">Links</div>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(selected.socialLinks || {}).map(([platform, link]) => (
                                                    link && (
                                                        <a
                                                            key={platform}
                                                            href={link.startsWith('http') ? link : `https://${link}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs hover:bg-white/10 transition-colors flex items-center gap-2"
                                                        >
                                                            <span className="capitalize">{platform}</span>
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Additional Context Section */}
                                <div className="grid gap-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Additional Context</label>
                                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                        <div className="text-white/40 text-[10px] font-bold uppercase tracking-tight mb-2">Bio</div>
                                        <div className="text-white/90 italic leading-relaxed">
                                            {selected.bio || "No bio provided."}
                                        </div>
                                    </div>
                                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                                        <div className="text-white/40 text-[10px] font-bold uppercase tracking-tight mb-2">Collab Interests</div>
                                        <div className="text-white/90 leading-relaxed">
                                            {selected.collaborationInterests || "Not specified."}
                                        </div>
                                    </div>
                                </div>

                                {selected.status === "PENDING" && (
                                    <div className="sticky bottom-0 mt-2 flex gap-2 pt-2 bg-[#0b0b14]/50 backdrop-blur-sm">
                                        <button
                                            onClick={() => approve(selected.id)}
                                            className="flex-1 rounded-xl bg-white text-black px-4 py-4 font-bold hover:opacity-90 active:scale-[0.98] transition-all"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => reject(selected.id)}
                                            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-4 font-bold hover:bg-white/10 active:scale-[0.98] transition-all"
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
                    Tip: Switch between Creators and Brands. Approve/Reject updates instantly.
                </div>
            </div>
        </main>
    );
}
