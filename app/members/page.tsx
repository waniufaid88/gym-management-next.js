"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Member = {
  id: string;
  name: string;
  phone: string;
  gender: string;
  shiftStart: string | null;
  shiftEnd: string | null;
};

type Shift = { id: string; startTime: string; endTime: string };

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [message, setMessage] = useState("");

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
        else {
          setShifts([]);
          setMessage(result.message || "Could not load shifts");
        }
      })
      .catch(() => {
        if (!cancelled) setMessage("Could not connect to load shifts");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const response = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const result = await response.json();
    setMessage(result.message);
    if (response.ok) {
      formElement.reset();
      loadMembers();
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Members</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add member</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addMember} className="grid gap-4 sm:grid-cols-2">
            <Input name="name" placeholder="Full name" required />
            <Input name="phone" placeholder="Phone" required />
            <Input name="address" placeholder="Address" required />
            <Input name="dob" type="date" required />
            <select
              name="gender"
              required
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select
              name="shiftId"
              defaultValue=""
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">No shift assigned</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.startTime} – {shift.endTime}
                </option>
              ))}
            </select>
            <Button type="submit" className="sm:col-span-2">
              Add member
            </Button>
          </form>
          {message && <p className="mt-3 text-sm">{message}</p>}
        </CardContent>
      </Card>

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
                  className="flex flex-wrap justify-between gap-2 border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.phone} · {member.gender}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.shiftStart
                      ? `${member.shiftStart} – ${member.shiftEnd}`
                      : "No shift"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
