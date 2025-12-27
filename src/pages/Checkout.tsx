
import { useState, useEffect } from "react";
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
import { Loader2, Lock, CreditCard, ArrowRight, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { sendBookingForm } from "@/lib/email";

export default function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
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
    const parsePrice = (priceStr?: string | number) => {
        if (!priceStr) return 0;
        if (typeof priceStr === 'number') return priceStr;
        return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
    };

    const amount = bookingData ? parsePrice(bookingData.price) : (resourceData?.price || 0);

    const validateCard = () => {
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
    };

    const handlePayment = async (e: React.FormEvent) => {
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
                // Send booking email to admin
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
                    throw new Error(`Payment recorded, but email failed: ${errorMsg}`);
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

            // Redirect
            navigate(resourceData ? "/resources" : "/");

        } catch (error) {
            console.error("Checkout error:", error);
            const msg = error instanceof Error ? error.message : "An error occurred. Please try again.";
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    };

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
                                            <span className="font-bold text-lg text-primary">$150.00</span>
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
                                        <span className="font-bold text-lg text-primary">${resourceData?.price?.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-medium">
                                    <span>Subtotal</span>
                                    <span>${amount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span>Tax (Estimated)</span>
                                    <span>$0.00</span>
                                </div>
                                <div className="flex justify-between font-bold text-xl pt-4 border-t border-border/50">
                                    <span>Total</span>
                                    <span>${amount.toFixed(2)}</span>
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
                                            <div className="relative w-64 h-64 bg-white/5 rounded-xl border border-border flex items-center justify-center p-4">
                                                <div className="absolute inset-0 bg-white/5 blur-xl -z-10" />
                                                <img
                                                    src="/payment-qr.jpg"
                                                    alt="Payment QR Code"
                                                    className="w-full h-full object-contain rounded-lg shadow-lg"
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
                                                <p>2. Complete the payment of <span className="text-primary font-bold">${amount.toFixed(2)}</span></p>
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
                                                    {paymentMethod === "card" ? `Pay $${amount.toFixed(2)}` : "Confirm Payment"}
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
