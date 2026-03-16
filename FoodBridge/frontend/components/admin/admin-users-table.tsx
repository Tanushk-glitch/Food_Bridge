"use client";

import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdminUserRow = {
  id: string;
  name: string;
  role: "ADMIN" | "DONOR" | "NGO" | "DELIVERY";
  city: string;
  verified: boolean;
  status: "active" | "suspended";
  totalDonations: number;
};

function statusBadge(user: AdminUserRow) {
  if (user.status === "suspended") {
    return <Badge variant="warning">Suspended</Badge>;
  }
  if (user.role === "NGO" && !user.verified) {
    return <Badge variant="warning">Pending</Badge>;
  }
  if (user.verified) {
    return <Badge variant="success">Verified</Badge>;
  }
  return <Badge variant="info">Active</Badge>;
}

export function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json().catch(() => ({}));
    setUsers(Array.isArray(data?.users) ? data.users : []);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => {
      setLoading(false);
    });
  }, []);

  const rows = useMemo(() => users, [users]);

  async function action(userId: string, fn: () => Promise<Response>) {
    try {
      setBusy(userId);
      const res = await fn();
      if (!res.ok) {
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage users</CardTitle>
        <CardDescription>Verification state and activity across the network.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Donations</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-sm text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              rows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.city || "—"}</TableCell>
                  <TableCell>{user.totalDonations}</TableCell>
                  <TableCell>{statusBadge(user)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user.role === "NGO" && !user.verified && (
                        <Button
                          size="sm"
                          variant="glass"
                          disabled={busy === user.id}
                          onClick={() =>
                            action(user.id, () =>
                              fetch(`/api/admin/ngos/${encodeURIComponent(user.id)}/approve`, { method: "PATCH" })
                            )
                          }
                        >
                          Approve
                        </Button>
                      )}
                      {user.status !== "suspended" && user.role !== "ADMIN" && (
                        <Button
                          size="sm"
                          variant="glass"
                          disabled={busy === user.id}
                          onClick={() =>
                            action(user.id, () =>
                              fetch(`/api/admin/users/${encodeURIComponent(user.id)}/suspend`, { method: "PATCH" })
                            )
                          }
                        >
                          Suspend
                        </Button>
                      )}
                      {user.role !== "ADMIN" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive text-destructive hover:bg-destructive/5"
                          disabled={busy === user.id}
                          onClick={() =>
                            action(user.id, () => fetch(`/api/admin/users/${encodeURIComponent(user.id)}`, { method: "DELETE" }))
                          }
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
