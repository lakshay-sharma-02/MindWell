
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Trash2, ExternalLink, Loader2 } from "lucide-react";

interface Booking {
    id: string;
    customer_name: string;
    customer_email: string;
    session_type: string;
    date: string;
    time: string;
    format: string;
    status: "confirmed" | "cancelled" | "completed";
    created_at: string;
}

export function BookingsManager() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch bookings
    const fetchBookings = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to load bookings.");
        } else {
            setBookings(data as Booking[]);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    // Cancel booking
    const cancelBooking = async (id: string) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        const { error } = await supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", id);

        if (error) {
            toast.error("Failed to cancel booking.");
        } else {
            toast.success("Booking cancelled.");
            fetchBookings();
        }
    };

    // Add to Google Calendar (Admin Side)
    // Generates a link to open Google Calendar with pre-filled details
    const addToGoogleCalendar = (booking: Booking) => {
        // 1. Construct Title and Details
        const text = encodeURIComponent(`${booking.session_type} with ${booking.customer_name}`);
        const details = encodeURIComponent(`Format: ${booking.format}\nEmail: ${booking.customer_email}`);
        const location = encodeURIComponent(booking.format === 'virtual' ? 'Virtual Meeting' : 'Psyche Space Office');

        // 2. Parse Date/Time to YYYYMMDDTHHMMSSZ format
        // Booking date: "2024-01-01", Time: "3:00 PM"
        // We need to parse this manually or use a library. 
        // Basic implementation for demonstration:
        try {
            const [year, month, day] = booking.date.split('-').map(Number);

            // Parse time is tricky without library due to AM/PM and timezones. 
            // Assuming local time for now or UTC? The app doesn't specify timezone clearly yet.
            // Let's assume the admin inputs it or it's just "Date" for now if parsing is hard.
            // Actually, let's try a best-effort parse.

            let [timePart, modifier] = booking.time.split(' ');
            let [hours, minutes] = timePart.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            const start = new Date(year, month - 1, day, hours, minutes);
            const end = new Date(start);
            end.setMinutes(end.getMinutes() + 50); // 50 min session default

            // Format to YYYYMMDDTHHMMSS
            const isoStart = start.toISOString().replace(/-|:|\.\d\d\d/g, "");
            const isoEnd = end.toISOString().replace(/-|:|\.\d\d\d/g, "");

            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&location=${location}&dates=${isoStart}/${isoEnd}`;

            window.open(url, '_blank');
        } catch (e) {
            console.error("Calendar Link Error", e);
            toast.error("Could not parse date for calendar link.");
        }
    };

    if (isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold">Manage Bookings</h2>
                <Button onClick={fetchBookings} variant="outline" size="sm">Refresh</Button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Session</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No bookings found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <div className="font-medium">{booking.customer_name}</div>
                                        <div className="text-xs text-muted-foreground">{booking.customer_email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">{booking.format}</Badge>
                                        <div className="text-sm mt-1">{booking.session_type}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span>{booking.date}</span>
                                            <span className="text-muted-foreground">{booking.time}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={booking.status === 'confirmed' ? "default" : booking.status === 'cancelled' ? "destructive" : "secondary"}>
                                            {booking.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {booking.status !== 'cancelled' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => addToGoogleCalendar(booking)}
                                                        title="Add to Google Calendar"
                                                    >
                                                        <Calendar className="w-4 h-4 text-blue-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => cancelBooking(booking.id)}
                                                        title="Cancel Booking"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
