"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MemberDialog, { type MemberData } from "./memberDialog";

type Shift = { id: string; startTime: string; endTime: string };

export default function MemberManagement() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberData | null>(null);

  async function loadMembers() {
    const response = await fetch("/api/members");
    const result = await response.json();
    if (response.ok) setMembers(result);
    else setMessage(result.message);
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/members")
      .then(async (response) => ({ response, result: await response.json() }))
      .then(({ response, result }) => {
        if (cancelled) return;
        if (response.ok) setMembers(result);
        else setMessage(result.message);
      });

    fetch("/api/shifts")
      .then(async (response) => ({ response, result: await response.json() }))
      .then(({ response, result }) => {
        if (cancelled) return;
        if (response.ok && Array.isArray(result)) setShifts(result);
        else setMessage(result.message || "Could not load shifts");
      })
      .catch(() => {
        if (!cancelled) setMessage("Could not connect to load shifts");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function openAddDialog() {
    setMessage("");
    setEditingMember(null);
    setDialogOpen(true);
  }

  function openEditDialog(member: MemberData) {
    setMessage("");
    setEditingMember(member);
    setDialogOpen(true);
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Members</h1>
        <Button onClick={openAddDialog}>Add member</Button>
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <MemberDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shifts={shifts}
        member={editingMember}
        onSaved={(savedMessage) => {
          setMessage(savedMessage);
          loadMembers();
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Member list</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No members added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.phone} · {member.gender}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      {member.shiftStart
                        ? `${member.shiftStart} – ${member.shiftEnd}`
                        : "No shift"}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(member)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
