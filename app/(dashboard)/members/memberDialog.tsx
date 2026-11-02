"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const memberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  address: z.string().min(3, "Please enter an address"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a gender",
  }),
  shiftId: z.string(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

const shifts = [
  { id: "1", name: "Morning (6 AM - 10 AM)" },
  { id: "2", name: "Evening (4 PM - 8 PM)" },
  { id: "3", name: "Night (8 PM - 11 PM)" },
];

export default function MemberDialog() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      dob: "",
      gender: "Male",
      shiftId: "",
    },
  });

  function onSubmit(data: MemberFormValues) {
    console.log("Member form:", data);

    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
          <DialogDescription>
            Enter the member details below to add a new gym member.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter member name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter phone number"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter address"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" {...register("dob")} />
              {errors.dob && (
                <p className="text-sm text-destructive">{errors.dob.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                {...register("gender")}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-sm text-destructive">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shiftId">Gym Shift</Label>
            <select
              id="shiftId"
              {...register("shiftId")}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">Select a shift</option>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name}
                </option>
              ))}
            </select>
            {errors.shiftId && (
              <p className="text-sm text-destructive">
                {errors.shiftId.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
