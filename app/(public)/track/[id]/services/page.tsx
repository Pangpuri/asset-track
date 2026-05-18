"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MoreHorizontal, Info } from "lucide-react";
import Link from "next/link";

const serviceSchema = z.object({
  title: z.string().min(2, "Please specify the issue title"),
  description: z.string().optional(),
  reportedBy: z.string().min(2, "Please specify your name"),
  serviceType: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function PublicServicePage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      priority: "medium",
      serviceType: "repair",
    }
  });

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          ...data
        }),
      });

      if (!response.ok) throw new Error("Error submitting");

      toast.success("Service request submitted successfully");
      router.push(`/track/${assetId}`);
    } catch (error) {
      toast.error("Unable to submit. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Header - IG Style */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <Link href={`/track/${assetId}`} className="active:opacity-50">
              <ArrowLeft className="h-6 w-6 text-black" />
            </Link>
            <h1 className="text-base font-bold text-black">Report Issue</h1>
          </div>
          <button className="active:opacity-50">
            <MoreHorizontal className="h-6 w-6 text-black" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100">
             <Info size={20} className="text-gray-400 mt-0.5" />
             <p className="text-xs text-gray-500 leading-normal">
               Please provide details about the issue. Our MIS team will review and contact you shortly.
             </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Issue Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Cannot power on, Screen broken"
                {...register("title")}
                className="h-11 border-gray-200 focus:border-black transition-colors"
              />
              {errors.title && <p className="text-[10px] text-red-500 font-bold">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reportedBy" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Your Name / Ext. *</Label>
              <Input 
                id="reportedBy" 
                {...register("reportedBy")} 
                placeholder="Who should we contact?" 
                className="h-11 border-gray-200 focus:border-black transition-colors"
              />
              {errors.reportedBy && <p className="text-[10px] text-red-500 font-bold">{errors.reportedBy.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Request Type</Label>
                <Select onValueChange={(v) => setValue("serviceType", v as any)} defaultValue="repair">
                  <SelectTrigger className="h-11 border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repair">General Repair</SelectItem>
                    <SelectItem value="replacement">Replacement</SelectItem>
                    <SelectItem value="complaint">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Priority</Label>
                <Select onValueChange={(v) => setValue("priority", v as any)} defaultValue="medium">
                  <SelectTrigger className="h-11 border-gray-200"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Additional Details</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                {...register("description")}
                rows={4}
                className="border-gray-200 focus:border-black transition-colors resize-none"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-black text-white h-12 font-bold text-sm tracking-wide"
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT REPORT"}
            </Button>
            <p className="text-[10px] text-gray-400 text-center mt-4 uppercase font-bold tracking-[0.2em]">
              MIS Department Support
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}