import { toast } from "sonner";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiRequest, type ApiEnvelope } from "@/lib/api";

type TokenResponse = {
  access_token: string;
  token_type: string;
};

const registrationSchema = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(8),
});

export type RegistrationSchemaType = z.infer<typeof registrationSchema>;


export const useRegister = () => {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<RegistrationSchemaType>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const handleRegister = async (data: RegistrationSchemaType) => {
    try {
      setIsPending(true);
      const response = await apiRequest<ApiEnvelope<TokenResponse>>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );

      if (!response.data) {
        throw new Error("Missing token in register response");
      }

      const token = response.data;
      localStorage.setItem("auth_token", token.access_token);
      toast.success("Registration successful");
      window.location.href = "/dashboard";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return { form, handleSubmit: handleRegister, isPending };
};
