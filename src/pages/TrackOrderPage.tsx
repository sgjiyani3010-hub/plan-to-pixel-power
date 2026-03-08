import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, Search, MapPin, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface OrderData {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_address: {
    name?: string;
    city?: string;
    state?: string;
    pincode?: string;
  } | null;
}

interface ShipmentData {
  status: string;
  courier_name: string | null;
  awb_code: string | null;
  tracking_url: string | null;
  estimated_delivery: string | null;
}

const ORDER_STATUSES = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
];

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [shipment, setShipment] = useState<ShipmentData | null>(null);

  const handleTrack = async () => {
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    setLoading(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, status, total, created_at, shipping_address')
        .eq('id', orderId.trim())
        .single();

      if (orderError || !orderData) {
        toast.error('Order not found. Please check your order ID.');
        setOrder(null);
        setShipment(null);
        return;
      }

      setOrder(orderData as OrderData);

      const { data: shipmentData } = await supabase
        .from('order_shipments')
        .select('status, courier_name, awb_code, tracking_url, estimated_delivery')
        .eq('order_id', orderId.trim())
        .single();

      setShipment(shipmentData as ShipmentData || null);
      toast.success('Order found!');
    } catch (err) {
      toast.error('Error tracking order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    const idx = ORDER_STATUSES.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Track Your Order</h1>
            <p className="font-body text-muted-foreground">Enter your order ID to see the current status</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-6 mb-8"
          >
            <div className="flex gap-3">
              <Input
                placeholder="Enter Order ID (e.g., abc12345-6789-...)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                className="flex-1"
              />
              <Button onClick={handleTrack} disabled={loading} className="gap-2">
                <Search className="w-4 h-4" />
                {loading ? 'Tracking...' : 'Track'}
              </Button>
            </div>
          </motion.div>

          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Order Summary */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-accent text-sm font-semibold text-foreground mb-4">Order Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="font-body text-xs text-muted-foreground">Order ID</p>
                    <p className="font-accent text-sm text-foreground truncate">{order.id.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground">Total Amount</p>
                    <p className="font-accent text-sm text-foreground">₹{order.total}</p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground">Order Date</p>
                    <p className="font-accent text-sm text-foreground">{format(new Date(order.created_at), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground">Status</p>
                    <p className="font-accent text-sm text-accent capitalize">{order.status}</p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-accent text-sm font-semibold text-foreground mb-6">Order Progress</h2>
                <div className="relative">
                  <div className="flex justify-between">
                    {ORDER_STATUSES.map((status, i) => {
                      const currentIdx = getStatusIndex(order.status);
                      const isCompleted = i <= currentIdx;
                      const isCurrent = i === currentIdx;
                      const Icon = status.icon;

                      return (
                        <div key={status.key} className="flex flex-col items-center relative z-10">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            isCompleted ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-4 ring-accent/20' : ''}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`font-accent text-xs mt-2 text-center ${
                            isCompleted ? 'text-foreground' : 'text-muted-foreground'
                          }`}>{status.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Progress Line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted -z-0">
                    <div 
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${(getStatusIndex(order.status) / (ORDER_STATUSES.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Shipment Details */}
              {shipment && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-accent text-sm font-semibold text-foreground mb-4">Shipment Details</h2>
                  <div className="space-y-3">
                    {shipment.courier_name && (
                      <div className="flex items-center gap-3">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <span className="font-body text-sm text-foreground">Courier: {shipment.courier_name}</span>
                      </div>
                    )}
                    {shipment.awb_code && (
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="font-body text-sm text-foreground">AWB: {shipment.awb_code}</span>
                      </div>
                    )}
                    {shipment.estimated_delivery && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-body text-sm text-foreground">
                          Expected: {format(new Date(shipment.estimated_delivery), 'dd MMM yyyy')}
                        </span>
                      </div>
                    )}
                    {shipment.tracking_url && (
                      <a 
                        href={shipment.tracking_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-accent hover:underline font-accent text-sm mt-2"
                      >
                        <MapPin className="w-4 h-4" />
                        Track on courier website →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {order.shipping_address && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="font-accent text-sm font-semibold text-foreground mb-4">Delivery Address</h2>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="font-body text-sm text-foreground">
                      <p>{order.shipping_address.name}</p>
                      <p className="text-muted-foreground">
                        {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TrackOrderPage;
