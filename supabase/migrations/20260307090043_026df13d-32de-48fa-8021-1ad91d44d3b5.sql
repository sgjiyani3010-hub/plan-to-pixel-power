
-- Admin policies for products
CREATE POLICY "Admins can insert products" ON public.products
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products" ON public.products
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products" ON public.products
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for orders (view all, update status)
CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update orders" ON public.orders
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for order_items (view all)
CREATE POLICY "Admins can view all order items" ON public.order_items
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
