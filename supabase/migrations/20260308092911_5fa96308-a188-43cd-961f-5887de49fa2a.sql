
-- Create order_shipments table
CREATE TABLE public.order_shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  shiprocket_order_id text,
  shiprocket_shipment_id text,
  courier_name text,
  courier_id integer,
  awb_code text,
  label_url text,
  manifest_url text,
  pickup_scheduled_at timestamptz,
  estimated_delivery timestamptz,
  tracking_url text,
  status text NOT NULL DEFAULT 'pending',
  package_length numeric,
  package_width numeric,
  package_height numeric,
  package_weight numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create notification_log table
CREATE TABLE public.notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  recipient_phone text NOT NULL,
  template_name text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- RLS: Admin full access on order_shipments
CREATE POLICY "Admins can manage order shipments"
  ON public.order_shipments FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: Users can view their own shipments
CREATE POLICY "Users can view own shipments"
  ON public.order_shipments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_shipments.order_id AND orders.user_id = auth.uid()
  ));

-- RLS: Admin full access on notification_log
CREATE POLICY "Admins can manage notification log"
  ON public.notification_log FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at on order_shipments
CREATE TRIGGER update_order_shipments_updated_at
  BEFORE UPDATE ON public.order_shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for order_shipments
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_shipments;
