"use server";

import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

export async function signUp(payload) {
  try {
    return await fetchMutation(api.signUp.signUp, payload);
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, error: "Signup failed. Please try again." };
  }
}
