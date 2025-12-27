-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    session_type TEXT NOT NULL,
    format TEXT NOT NULL,
    date TEXT NOT NULL, -- Storing as YYYY-MM-DD string as per app convention
    time TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    payment_method TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Admins can do everything (Select, Update, Delete)
CREATE POLICY "Admins can manage all bookings" ON public.bookings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 2. Public/Users can insert bookings (during checkout)
CREATE POLICY "Public can insert bookings" ON public.bookings
    FOR INSERT
    WITH CHECK (true);

-- 3. Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT
    USING (auth.uid() = user_id);
