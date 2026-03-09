-- Wallet/Store Credits table
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wallet_user_unique UNIQUE (user_id),
  CONSTRAINT balance_non_negative CHECK (balance >= 0)
);

-- Wallet transactions for audit trail
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  description text,
  order_id uuid REFERENCES public.orders(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Abandoned carts table
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  cart_data jsonb NOT NULL,
  recovery_email_sent boolean DEFAULT false,
  recovered boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Guest orders table (for orders without user accounts)
CREATE TABLE IF NOT EXISTS public.guest_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add email column to orders for guest checkout
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_email text;

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallets
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for wallet transactions
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.wallets WHERE wallets.id = wallet_transactions.wallet_id AND wallets.user_id = auth.uid()));

-- RLS policies for abandoned carts
CREATE POLICY "Users can manage own abandoned carts" ON public.abandoned_carts FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all abandoned carts" ON public.abandoned_carts FOR ALL 
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS policies for guest orders
CREATE POLICY "Admins can manage guest orders" ON public.guest_orders FOR ALL 
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create trigger for wallet updated_at
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for abandoned_carts updated_at
CREATE TRIGGER update_abandoned_carts_updated_at BEFORE UPDATE ON public.abandoned_carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();