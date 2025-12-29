import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
import { toast } from "sonner";

export type Service = Tables<"booking_services">;

export const useServices = () => {
    const queryClient = useQueryClient();

    const servicesQuery = useQuery({
        queryKey: ["services"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("booking_services")
                .select("*")
                .order("price", { ascending: true });

            if (error) throw error;
            return data as Service[];
        },
    });

    const createService = useMutation({
        mutationFn: async (newService: Omit<Service, "id" | "created_at">) => {
            const { data, error } = await supabase
                .from("booking_services")
                .insert([newService])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
            toast.success("Service created successfully");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to create service");
        }
    });

    const updateService = useMutation({
        mutationFn: async ({ id, ...updates }: { id: string } & Partial<Service>) => {
            const { data, error } = await supabase
                .from("booking_services")
                .update(updates)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
            toast.success("Service updated successfully");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to update service");
        }
    });

    const deleteService = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("booking_services")
                .delete()
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["services"] });
            toast.success("Service deleted successfully");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to delete service");
        }
    });

    return {
        services: servicesQuery.data ?? [],
        isLoading: servicesQuery.isLoading,
        isError: servicesQuery.isError,
        createService,
        updateService,
        deleteService
    };
};
