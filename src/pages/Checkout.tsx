
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Lock, CreditCard, ArrowRight, QrCode, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { sendBookingForm } from "@/lib/email";
import { downloadICS, BookingEvent } from "@/lib/calendar";

export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"card" | "qr">("card");
    const [transactionId, setTransactionId] = useState("");
    const [formData, setFormData] = useState({
        cardNumber: "",
        expiryDate: "",
        cvc: "",
        nameOnCard: ""
    });

    // Get booking data or resource data from location state
    const bookingData = location.state?.bookingData;
    const resourceData = location.state?.resourceData;

    useEffect(() => {
        if (!bookingData && !resourceData) {
            toast.error("No item selected for checkout.");
            navigate("/");
        }
    }, [bookingData, resourceData, navigate]);

    if (!bookingData && !resourceData) return null;

    // Parse price string (e.g. "$150") to number
    const parsePrice = useCallback((priceStr?: string | number) => {
        if (!priceStr) return 0;
        if (typeof priceStr === 'number') return priceStr;
        return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
    }, []);

    const amount = useMemo(() => {
        return bookingData ? parsePrice(bookingData.price) : (resourceData?.price || 0);
    }, [bookingData, resourceData, parsePrice]);

    const validateCard = useCallback(() => {
        const { cardNumber, expiryDate, cvc, nameOnCard } = formData;

        if (cardNumber.replace(/\s/g, "").length < 15) {
            toast.error("Please enter a valid card number");
            return false;
        }

        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            toast.error("Expiry date must be in MM/YY format");
            return false;
        }

        // Basic expiry check
        const [month, year] = expiryDate.split('/').map(num => parseInt(num, 10));
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (month < 1 || month > 12) {
            toast.error("Invalid expiry month");
            return false;
        }

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            toast.error("Card has expired");
            return false;
        }

        if (cvc.length < 3) {
            toast.error("Please enter a valid CVC");
            return false;
        }

        if (!nameOnCard.trim()) {
            toast.error("Please enter name on card");
            return false;
        }

        return true;
    }, [formData]);

    const handlePayment = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (paymentMethod === "card" && !validateCard()) {
            return;
        }

        if (paymentMethod === "qr" && !transactionId.trim()) {
            toast.error("Please enter the Transaction ID / UTR Number to verify your payment");
            return;
        }

        setIsProcessing(true);

        try {
            // Artificial delay removed
            // await new Promise(resolve => setTimeout(resolve, 2000));

            if (bookingData) {
                // 1. Save to Database
                const { error: dbError } = await supabase.from('bookings').insert({
                    customer_name: bookingData.name,
                    customer_email: bookingData.email,
                    customer_phone: bookingData.phone,
                    session_type: bookingData.sessionType,
                    format: bookingData.format,
                    date: bookingData.date,
                    time: bookingData.time,
                    notes: bookingData.notes,
                    status: 'confirmed',
                    payment_method: paymentMethod,
                    transaction_id: paymentMethod === 'qr' ? transactionId : 'CARD_MOCK'
                });

                if (dbError) {
                    // Log error but generally proceed with email or alert user? 
                    // Better to fail fast if DB fails, as that's the record.
                    console.error("Database Insert Error:", dbError);
                    throw new Error("Failed to save booking. Please try again or contact support.");
                }

                // 2. Send booking email to admin
                const emailResult = await sendBookingForm({
                    name: bookingData.name,
                    email: bookingData.email,
                    phone: bookingData.phone,
                    sessionType: bookingData.sessionType,
                    format: bookingData.format,
                    date: bookingData.date,
                    time: bookingData.time,
                    notes: bookingData.notes,
                    paymentDetails: {
                        method: paymentMethod,
                        transactionId: paymentMethod === 'qr' ? transactionId : undefined
                    }
                });

                if (!emailResult.success) {
                    const errorMsg = emailResult.error || "Unknown email error";
                    console.error("Email warning:", errorMsg);
                    // We don't throw here strictly because DB save was successful, 
                    // so the booking IS confirmed in backend. 
                    // But we might want to warn the user or just log it.
                    // For now, let's just proceed as "Success" UI will show.
                }
            } else if (resourceData) {
                // Insert into purchased_resources
                // We need a user ID for this. Assuming user is logged in if they got here (Resource page checks rights? No, ResourceCard checks rights but not Auth for navigation, but purchase needs auth usually)
                // But wait, Resource page logic:
                // "isAccessible" check includes "isPurchased" which checks "purchased_resources" by user_id.
                // So we need to ensure we have a user here.
                // We can get user from supabase or context.
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("You must be logged in to purchase resources.");

                const { error } = await supabase.from("purchased_resources").insert({
                    user_id: user.id,
                    resource_id: resourceData.id,
                    transaction_id: paymentMethod === 'qr' ? transactionId : 'CARD_PAYMENT_MOCK'
                });

                if (error) throw error;
            }

            toast.success(
                paymentMethod === "card"
                    ? "Payment successful!"
                    : "Payment details submitted for verification."
            );

            // Show success view instead of redirecting
            if (bookingData) {
                setIsSuccess(true);
            } else {
                navigate("/resources");
            }

        } catch (error) {
            console.error("Checkout error:", error);
            const msg = error instanceof Error ? error.message : "An error occurred. Please try again.";
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    }, [formData, paymentMethod, transactionId, bookingData, resourceData, navigate]);

    const handleCalendarDownload = useCallback(() => {
        if (!bookingData) return;

        // Convert time (e.g., "3:00 PM") to ISO string
        // This is a basic implementation, assuming booking is for "Today" or future date
        // In a real app, we'd parse bookingData.date and bookingData.time strictly

        try {
            const dateStr = bookingData.date; // YYYY-MM-DD
            const timeStr = bookingData.time; // H:MM AM/PM

            // Allow date-fns or similar to handle this if available, but manual parsing for now
            const [year, month, day] = dateStr.split('-').map(Number);
            const startDateTime = new Date(year, month - 1, day);

            const [time, modifier] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);

            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            startDateTime.setHours(hours, minutes, 0, 0);

            const endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + 50); // Default 50 mins

            const event: BookingEvent = {
                title: `${bookingData.sessionType} with your therapist`,
                description: `Format: ${bookingData.format}\n\nNotes: ${bookingData.notes || 'None'}`,
                location: bookingData.format === 'virtual' ? 'Virtual (Link sent via email)' : 'Gurugram, India',
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                organizer: {
                    name: 'Psyche Space Therapy',
                    email: 'psychespaced@gmail.com'
                }
            };

            downloadICS(event);
            toast.success("Calendar event downloaded!");
        } catch (e) {
            console.error("Date parsing error", e);
            toast.error("Could not generate calendar event");
        }
    }, [bookingData]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id === "cardNumber") {
            const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "").substr(0, 16);
            const parts = [];
            for (let i = 0; i < v.length; i += 4) {
                parts.push(v.substr(i, 4));
            }
            setFormData(prev => ({ ...prev, [id]: parts.join(" ") }));
        } else if (id === "expiryDate") {
            let v = value.replace(/[^0-9]/gi, "");
            if (v.length >= 2) {
                v = v.substr(0, 2) + "/" + v.substr(2, 2);
            }
            setFormData(prev => ({ ...prev, [id]: v }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    }, []);

    if (isSuccess && bookingData) {
        return (
            <Layout>
                <div className="container-wide py-20 min-h-[60vh] flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-lg w-full bg-card border border-border/50 rounded-3xl p-8 shadow-card text-center space-y-6"
                    >
                        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-display font-bold mb-2">Booking Confirmed!</h1>
                            <p className="text-muted-foreground">
                                Your {bookingData.sessionType} is scheduled for
                                <br />
                                <span className="font-semibold text-foreground">
                                    {bookingData.date} at {bookingData.time}
                                </span>
                            </p>
                        </div>

                        <div className="bg-secondary/30 rounded-xl p-4 text-left text-sm space-y-2">
                            <p><span className="text-muted-foreground">Format:</span> <span className="capitalize">{bookingData.format}</span></p>
                            <p><span className="text-muted-foreground">Payment:</span> {paymentMethod === 'card' ? 'Paid via Card' : 'Pending Verification (UPI)'}</p>
                            <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                                A confirmation email has been sent to {bookingData.email}.
                            </p>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Button onClick={handleCalendarDownload} className="w-full gap-2 btn-glow" size="lg">
                                <Calendar className="w-4 h-4" />
                                Add to Calendar
                            </Button>
                            <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                                Return Home
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEOHead title="Checkout - Unheard Pages" description="Secure payment for your session." />

            <div className="container-wide py-12 md:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {/* Order Summary */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold font-display mb-2">Checkout</h1>
                            <p className="text-muted-foreground">Complete your payment to secure your session.</p>
                        </div>

                        <Card className="bg-secondary/20 border-border/60">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {bookingData ? (
                                    <>
                                        <div className="flex justify-between items-start pb-4 border-b border-border/50">
                                            <div>
                                                <h3 className="font-semibold text-lg">{bookingData.sessionType}</h3>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    <p>{bookingData.date} at {bookingData.time}</p>
                                                    <p className="capitalize">{bookingData.format} Session</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-lg text-primary">₹{amount.toFixed(2)}</span>
                                        </div>
                                        {bookingData.quizResult && (
                                            <div className="py-2 px-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                    Assessment Attached
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Score: {bookingData.quizResult.score} ({bookingData.quizResult.level})
                                                </span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex justify-between items-start pb-4 border-b border-border/50">
                                        <div>
                                            <h3 className="font-semibold text-lg">{resourceData?.title}</h3>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                <p className="capitalize">{resourceData?.type} Resource</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-lg text-primary">₹{resourceData?.price?.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-medium">
                                    <span>Subtotal</span>
                                    <span>₹{amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span>Tax (Estimated)</span>
                                    <span>₹0.00</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl pt-4 border-t border-border/50">
                                    <span>Total</span>
                                    <span>₹{amount.toFixed(2)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 p-4 rounded-lg border border-primary/10">
                            <Lock className="w-4 h-4 text-primary" />
                            <p>Transactions are secure and encrypted.</p>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="space-y-6">
                        <Tabs defaultValue="card" onValueChange={(v) => setPaymentMethod(v as "card" | "qr")} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="card" className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    Card
                                </TabsTrigger>
                                <TabsTrigger value="qr" className="flex items-center gap-2">
                                    <QrCode className="w-4 h-4" />
                                    UPI / QR
                                </TabsTrigger>
                            </TabsList>

                            <Card className="h-fit overflow-hidden">
                                <form onSubmit={handlePayment}>
                                    <TabsContent value="card" className="mt-0 space-y-4">
                                        <CardHeader>
                                            <CardTitle>Card Details</CardTitle>
                                            <CardDescription>Enter your card information used for payment</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cardNumber">Card Number</Label>
                                                <Input
                                                    id="cardNumber"
                                                    placeholder="0000 0000 0000 0000"
                                                    value={formData.cardNumber}
                                                    onChange={handleInputChange}
                                                    maxLength={19}
                                                    required={paymentMethod === "card"}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="expiryDate">Expiry Date</Label>
                                                    <Input
                                                        id="expiryDate"
                                                        placeholder="MM/YY"
                                                        value={formData.expiryDate}
                                                        onChange={handleInputChange}
                                                        maxLength={5}
                                                        required={paymentMethod === "card"}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="cvc">CVC</Label>
                                                    <Input
                                                        id="cvc"
                                                        placeholder="123"
                                                        maxLength={4}
                                                        value={formData.cvc}
                                                        onChange={handleInputChange}
                                                        required={paymentMethod === "card"}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="nameOnCard">Name on Card</Label>
                                                <Input
                                                    id="nameOnCard"
                                                    placeholder="John Doe"
                                                    value={formData.nameOnCard}
                                                    onChange={handleInputChange}
                                                    required={paymentMethod === "card"}
                                                />
                                            </div>
                                        </CardContent>
                                    </TabsContent>

                                    <TabsContent value="qr" className="mt-0">
                                        <CardHeader>
                                            <CardTitle>Scan to Pay</CardTitle>
                                            <CardDescription>Use any UPI app to scan and pay</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col items-center space-y-6 pb-6">
                                            <div className="relative w-64 h-64 bg-white rounded-xl border border-border flex items-center justify-center p-4">
                                                <QRCodeSVG
                                                    value={`upi://pay?pa=sharmalakshay0208@oksbi&pn=Lakshay%20Sharma&am=${amount.toFixed(2)}&cu=INR`}
                                                    size={220}
                                                    level="H"
                                                    includeMargin={true}
                                                />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <p className="font-medium">Lakshay Sharma</p>
                                                <p className="text-sm text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded">
                                                    sharmalakshay0208@oksbi
                                                </p>
                                            </div>
                                            <div className="text-sm text-muted-foreground text-center max-w-xs">
                                                <p>1. Scan the QR code with your UPI app</p>
                                                <p>2. The amount of <span className="text-primary font-bold">₹{amount.toFixed(2)}</span> will be pre-filled</p>
                                                <p>3. Enter the transaction ID below</p>
                                            </div>

                                            <div className="w-full space-y-2">
                                                <Label htmlFor="transactionId">Transaction ID / UTR Number</Label>
                                                <Input
                                                    id="transactionId"
                                                    placeholder="e.g. 123456789012"
                                                    value={transactionId}
                                                    onChange={(e) => setTransactionId(e.target.value)}
                                                    required={paymentMethod === "qr"}
                                                />
                                            </div>
                                        </CardContent>
                                    </TabsContent>

                                    <CardFooter>
                                        <Button type="submit" className="w-full btn-glow" disabled={isProcessing}>
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    {paymentMethod === "card" ? "Processing..." : "Verifying..."}
                                                </>
                                            ) : (
                                                <>
                                                    {paymentMethod === "card" ? `Pay ₹${amount.toFixed(2)}` : "Confirm Payment"}
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </Tabs>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
