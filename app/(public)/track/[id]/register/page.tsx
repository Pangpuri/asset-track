"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, MoreHorizontal, Info, ShieldCheck } from "lucide-react";
import Link from "next/link";

const registerSchema = z.object({
  assetCode: z.string().min(2, "Asset code is required").optional().or(z.literal("")),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  assignedTo: z.string().min(2, "Name is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  assignedBy: z.string().optional(),
  notes: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await fetch(`/api/assets?id=${assetId}`);
        if (res.ok) {
          const data = await res.json();
          setAsset(data);
          if (data.assetCode) setValue("assetCode", data.assetCode);
          if (data.category) setValue("category", data.category);
          if (data.brand) setValue("brand", data.brand);
          if (data.model) setValue("model", data.model);
          if (data.serialNumber) setValue("serialNumber", data.serialNumber);
          if (data.location) setValue("location", data.location);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [assetId]);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      if (asset?.status === "pending") {
        if (!data.assetCode || !data.category) {
          toast.error("Asset code and category are required");
          return;
        }

        const assetUpdate = await fetch("/api/assets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: assetId,
            assetCode: data.assetCode,
            category: data.category,
            brand: data.brand,
            model: data.model,
            serialNumber: data.serialNumber,
            status: "active",
          }),
        });

        if (!assetUpdate.ok) throw new Error("Update failed");
      }

      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          action: "assign",
          assignedTo: data.assignedTo,
          department: data.department,
          location: data.location,
          assignedBy: data.assignedBy,
          notes: data.notes,
          deliveryDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Logging failed");

      toast.success("Registered successfully");
      router.push(`/track/${assetId}`);
    } catch (error) {
      toast.error("Unable to save. Please try again.");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-black" />
    </div>
  );

  const isPending = asset?.status === "pending";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Header - IG Style */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <Link href={`/track/${assetId}`} className="active:opacity-50">
              <ArrowLeft className="h-6 w-6 text-black" />
            </Link>
            <h1 className="text-base font-bold text-black">
              {isPending ? "Register Device" : "Log Delivery"}
            </h1>
          </div>
          <button className="active:opacity-50">
            <MoreHorizontal className="h-6 w-6 text-black" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8 pb-20">
          <div className="flex flex-col items-center gap-2 py-4">
             <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-black border border-gray-100">
                <ShieldCheck size={32} />
             </div>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Secure Registration</p>
          </div>

          {isPending && (
            <div className="space-y-6">
               <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest">1. Device Details</span>
               </div>
               
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="assetCode" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Asset Code *</Label>
                    <Input id="assetCode" {...register("assetCode")} placeholder="e.g. IT-001" className="h-11 border-gray-200" />
                    {errors.assetCode && <p className="text-[10px] text-red-500 font-bold">{errors.assetCode.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Category *</Label>
                    <Select onValueChange={(v) => setValue("category", v as string)}>
                      <SelectTrigger className="h-11 border-gray-200"><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="computer">Computer/Laptop</SelectItem>
                        <SelectItem value="printer">Printer</SelectItem>
                        <SelectItem value="monitor">Monitor</SelectItem>
                        <SelectItem value="network">Network</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="brand" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Brand</Label>
                      <Input id="brand" {...register("brand")} placeholder="e.g. HP" className="h-11 border-gray-200" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="model" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Model</Label>
                      <Input id="model" {...register("model")} placeholder="e.g. ProBook" className="h-11 border-gray-200" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="serialNumber" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Serial Number</Label>
                    <Input id="serialNumber" {...register("serialNumber")} className="h-11 border-gray-200" />
                  </div>
               </div>
            </div>
          )}

          <div className="space-y-6">
             <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest">
                  {isPending ? "2. Delivery Info" : "Delivery Information"}
                </span>
             </div>

             <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="assignedTo" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Assigned To *</Label>
                  <Input id="assignedTo" placeholder="Full Name" {...register("assignedTo")} className="h-11 border-gray-200" />
                  {errors.assignedTo && <p className="text-[10px] text-red-500 font-bold">{errors.assignedTo.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Department *</Label>
                    <Input id="department" {...register("department")} placeholder="e.g. HR, Sales" className="h-11 border-gray-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Location *</Label>
                    <Input id="location" {...register("location")} placeholder="e.g. Room 302" className="h-11 border-gray-200" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Additional Notes</Label>
                  <Textarea id="notes" {...register("notes")} rows={3} placeholder="Any other info..." className="border-gray-200 resize-none" />
                </div>
             </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-2 max-w-lg mx-auto z-20">
            <Link href={`/track/${assetId}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full h-11 border-gray-200 text-black font-bold">CANCEL</Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] h-11 bg-black text-white font-bold"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "SAVE RECORD"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
