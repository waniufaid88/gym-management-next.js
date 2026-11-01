"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const registerSchema = z.object({
  name: z.string().min(5, "Name must be at least 5 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setMessage("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || "Registration failed");
        return;
      }
      console.log("res is :", result);

      router.push("/members");
      router.refresh();
    } catch {
      setMessage("Could not connect. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Register
          </CardTitle>
          <CardDescription>Create your gym account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  {...register("email")}
                  type="email"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  {...register("phone")}
                  type="tel"
                  placeholder="Enter your phone"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  {...register("password")}
                  type="password"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </Field>
            </FieldGroup>
            {message && (
              <p role="alert" className="pt-3 text-sm text-red-500">
                {message}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="reset" variant="outline">
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600"
              >
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
            </div>
            <p className="pt-4 text-center text-sm">
              Already registered?{" "}
              <Link className="text-green-700 underline" href="/login">
                Login
              </Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
