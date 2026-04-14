"use client";

import { useState, useCallback } from "react";
import type { ContactFormData, SubmitStatus } from "../types";
import { INITIAL_FORM_DATA } from "../constants";

import { apiPost } from "@/lib/api-client";

export function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      await apiPost("/api/forms", {
        type: "CONTACT",
        payload: formData,
      });
      setSubmitStatus("success");
      setFormData(INITIAL_FORM_DATA);
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const resetStatus = useCallback(() => {
    setSubmitStatus("idle");
  }, []);

  return {
    formData,
    isSubmitting,
    submitStatus,
    handleChange,
    handleSubmit,
    resetStatus,
  };
}
