import { useState, useEffect } from "react";
import { format, addMonths, isSameDay, isToday, isBefore, startOfToday, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ChevronLeft, Clock, Calendar as CalendarIcon, Sun, Moon, Sunrise } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface BookingCalendarProps {
    selectedDate: Date | undefined;
    onDateSelect: (date: Date | undefined) => void;
    selectedTime: string | null;
    onTimeSelect: (time: string) => void;
}

// Mock availability data generator
const generateTimeSlots = (date: Date) => {
    if (!date) return [];

    // Weekend: Fewer slots
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (isWeekend) return [];

    return [
        { time: "09:00 AM", period: "morning" },
        { time: "10:00 AM", period: "morning" },
        { time: "11:00 AM", period: "morning" },
        { time: "01:00 PM", period: "afternoon" },
        { time: "02:00 PM", period: "afternoon" },
        { time: "03:00 PM", period: "afternoon" },
        { time: "04:00 PM", period: "evening" },
        { time: "05:00 PM", period: "evening" }
    ];
};

export function BookingCalendar({
    selectedDate,
    onDateSelect,
    selectedTime,
    onTimeSelect
}: BookingCalendarProps) {
    const [month, setMonth] = useState<Date>(new Date());

    const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

    const morningSlots = timeSlots.filter(s => s.period === "morning");
    const afternoonSlots = timeSlots.filter(s => s.period === "afternoon");
    const eveningSlots = timeSlots.filter(s => s.period === "evening");

    const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateString = e.target.value;
        if (!dateString) {
            onDateSelect(undefined);
            return;
        }

        // Parse the YYYY-MM-DD string correctly
        const [year, month, day] = dateString.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);
        onDateSelect(newDate);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Date Selection */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground">Select Date</h3>
                </div>

                <div className="p-2 sm:p-4 rounded-3xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
                    {/* Native Date Picker for Mobile (Portrait) */}
                    <div className="block md:hidden px-2 mb-4">
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                            Tap to open calendar
                        </label>
                        <div className="relative">
                            <Input
                                type="date"
                                className="w-full text-base py-6 pl-10 bg-background/50 border-input"
                                min={format(new Date(), 'yyyy-MM-dd')}
                                value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                                onChange={handleNativeDateChange}
                            />
                            <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    {/* Custom Calendar for Desktop/Tablet */}
                    <div className="hidden md:block">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={onDateSelect}
                            month={month}
                            onMonthChange={setMonth}
                            disabled={(date) => isBefore(date, startOfToday()) || date.getDay() === 0 || date.getDay() === 6}
                            className="rounded-xl border-none w-full"
                            classNames={{
                                month: "space-y-4 w-full",
                                caption: "flex justify-center pt-1 relative items-center mb-4",
                                caption_label: "text-base font-display font-medium",
                                nav: "space-x-1 flex items-center",
                                head_row: "flex w-full mt-2",
                                head_cell: "text-muted-foreground rounded-md w-8 sm:w-9 font-normal text-[0.8rem] flex-1",
                                row: "flex w-full mt-2",
                                cell: "text-center text-xs sm:text-sm p-0 relative [&:has([aria-selected])]:bg-primary/5 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex-1",
                                day: cn(
                                    "h-8 w-8 sm:h-10 sm:w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-primary/10 rounded-full transition-all mx-auto flex items-center justify-center data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground shadow-sm"
                                ),
                                day_today: "bg-accent/10 text-accent font-bold",
                                day_outside: "text-muted-foreground opacity-50",
                                day_disabled: "text-muted-foreground opacity-30",
                                day_hidden: "invisible",
                            }}
                        />
                    </div>
                </div>

                {/* Selected Date Summary */}
                <AnimatePresence>
                    {selectedDate && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                                {format(selectedDate, "d")}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    {format(selectedDate, "EEEE, MMMM yyyy")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {timeSlots.length} slots available
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Time Selection */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground">Select Time</h3>
                </div>

                {!selectedDate ? (
                    <div className="h-[350px] flex flex-col items-center justify-center p-8 text-center rounded-3xl border border-dashed border-border bg-card/30">
                        <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">Please select a date first to view available time slots.</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[400px] w-full pr-4">
                        <div className="space-y-6">
                            {/* Morning */}
                            {morningSlots.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Sunrise className="w-4 h-4" /> Morning
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {morningSlots.map((slot) => (
                                            <TimeSlotButton
                                                key={slot.time}
                                                time={slot.time}
                                                isSelected={selectedTime === slot.time}
                                                onClick={() => onTimeSelect(slot.time)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Afternoon */}
                            {afternoonSlots.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Sun className="w-4 h-4" /> Afternoon
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {afternoonSlots.map((slot) => (
                                            <TimeSlotButton
                                                key={slot.time}
                                                time={slot.time}
                                                isSelected={selectedTime === slot.time}
                                                onClick={() => onTimeSelect(slot.time)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Evening */}
                            {eveningSlots.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Moon className="w-4 h-4" /> Evening
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {eveningSlots.map((slot) => (
                                            <TimeSlotButton
                                                key={slot.time}
                                                time={slot.time}
                                                isSelected={selectedTime === slot.time}
                                                onClick={() => onTimeSelect(slot.time)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {timeSlots.length === 0 && (
                                <div className="p-8 text-center rounded-2xl bg-secondary/30">
                                    <p className="text-muted-foreground">No slots available for this date.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </div>
    );
}

const TimeSlotButton = ({ time, isSelected, onClick }: { time: string, isSelected: boolean, onClick: () => void }) => (
    <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
            "py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-200",
            isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card hover:bg-secondary border-border/50 hover:border-primary/30 text-foreground"
        )}
    >
        {time}
    </motion.button>
);
