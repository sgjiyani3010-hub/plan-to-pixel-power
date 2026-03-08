import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Package,
  Truck,
  Tag,
  CalendarIcon,
  FileText,
  MapPin,
  CheckCircle2,
  Loader2,
  Download,
  Printer,
  XCircle,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  products: { name: string } | null;
}

interface Shipment {
  id: string;
  order_id: string;
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  courier_name: string | null;
  courier_id: number | null;
  awb_code: string | null;
  label_url: string | null;
  manifest_url: string | null;
  pickup_scheduled_at: string | null;
  estimated_delivery: string | null;
  tracking_url: string | null;
  status: string;
  package_length: number | null;
  package_width: number | null;
  package_height: number | null;
  package_weight: number | null;
}

interface CourierOption {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  etd: string;
  estimated_delivery_days: number;
}

interface TrackingData {
  tracking_data?: {
    shipment_track?: Array<{
      current_status: string;
    }>;
    shipment_track_activities?: Array<{
      date: string;
      status: string;
      activity: string;
      location: string;
    }>;
  };
}

interface Props {
  order: {
    id: string;
    user_id: string;
    total: number;
    status: string;
    shipping_address: Record<string, string> | null;
    coupon_code: string | null;
    discount: number | null;
    created_at: string;
    customerName?: string;
  };
  items: OrderItem[];
  onStatusChange: () => void;
}

const STEPS = [
  { key: 'review', label: 'Review', icon: Package },
  { key: 'shipment', label: 'Create Shipment', icon: Truck },
  { key: 'courier', label: 'Select Courier', icon: Tag },
  { key: 'label', label: 'Label & Manifest', icon: FileText },
  { key: 'pickup', label: 'Schedule Pickup', icon: CalendarIcon },
  { key: 'tracking', label: 'Tracking', icon: MapPin },
];

function getActiveStep(orderStatus: string, shipment: Shipment | null): number {
  if (!shipment) {
    if (orderStatus === 'pending') return 0;
    if (orderStatus === 'confirmed') return 1;
    if (orderStatus === 'processing') return 1;
  }
  if (shipment) {
    if (shipment.status === 'created') return 2;
    if (shipment.status === 'ready_to_ship') return 3;
    if (shipment.status === 'label_generated') return 4;
    if (['pickup_scheduled', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(shipment.status)) return 5;
  }
  return 0;
}

export function OrderFulfillment({ order, items, onStatusChange }: Props) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [couriers, setCouriers] = useState<CourierOption[]>([]);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [pickupDate, setPickupDate] = useState<Date>();
  const [packageDims, setPackageDims] = useState({ length: 10, width: 10, height: 5, weight: 0.5 });
  const { toast } = useToast();

  const activeStep = getActiveStep(order.status, shipment);

  useEffect(() => {
    fetchShipment();
  }, [order.id]);

  const fetchShipment = async () => {
    const { data } = await supabase
      .from('order_shipments')
      .select('*')
      .eq('order_id', order.id)
      .maybeSingle();
    setShipment(data as Shipment | null);
  };

  const callShiprocket = async (action: string, extra: Record<string, unknown> = {}) => {
    setLoading(action);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('shiprocket', {
        body: { action, order_id: order.id, ...extra },
      });

      if (res.error) throw new Error(res.error.message);
      await fetchShipment();
      onStatusChange();
      toast({ title: 'Success', description: `${action} completed` });
      return res.data;
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(null);
    }
  };

  const sendWhatsApp = async (templateName: string, params: string[]) => {
    try {
      // Get customer phone from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('user_id', order.user_id)
        .single();

      await supabase.functions.invoke('whatsapp', {
        body: {
          action: 'send-both',
          order_id: order.id,
          customer_phone: profile?.phone || '',
          template_name: templateName,
          parameters: params,
        },
      });
      toast({ title: 'WhatsApp notification sent' });
    } catch (err: any) {
      toast({ title: 'WhatsApp error', description: err.message, variant: 'destructive' });
    }
  };

  const handleAcceptOrder = async () => {
    setLoading('accept');
    const { error } = await supabase.from('orders').update({ status: 'confirmed' }).eq('id', order.id);
    if (!error) {
      onStatusChange();
      await sendWhatsApp('order_confirmed', [order.id.slice(0, 8), `₹${Number(order.total).toLocaleString()}`]);
    }
    setLoading(null);
  };

  const handleCreateShipment = () => {
    callShiprocket('create-order', {
      package_length: packageDims.length,
      package_width: packageDims.width,
      package_height: packageDims.height,
      package_weight: packageDims.weight,
    });
  };

  const handleGetCouriers = async () => {
    const data = await callShiprocket('get-couriers');
    if (data?.data?.available_courier_companies) {
      setCouriers(data.data.available_courier_companies);
    }
  };

  const handleAssignCourier = (courierId: number) => {
    callShiprocket('assign-courier', { courier_id: courierId });
  };

  const handleGenerateLabel = () => callShiprocket('generate-label');
  const handleGenerateManifest = () => callShiprocket('generate-manifest');

  const handleSchedulePickup = () => {
    const dateStr = pickupDate ? format(pickupDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    callShiprocket('schedule-pickup', { pickup_date: dateStr }).then(() => {
      if (shipment?.tracking_url) {
        sendWhatsApp('order_shipped', [
          order.id.slice(0, 8),
          shipment.courier_name || 'Courier',
          shipment.tracking_url,
        ]);
      }
    });
  };

  const handleRefreshTracking = async () => {
    if (!shipment) return;
    setLoading('refresh-tracking');
    try {
      // 1. Trigger the poll for this specific shipment (updates DB + sends notifications)
      await supabase.functions.invoke('shiprocket-poll', {
        body: { shipment_id: shipment.id },
      });

      // 2. Re-fetch shipment from DB to get updated status
      const { data: updatedShipment } = await supabase
        .from('order_shipments')
        .select('*')
        .eq('id', shipment.id)
        .single();

      const oldStatus = shipment.status;
      if (updatedShipment) setShipment(updatedShipment as Shipment);

      // 3. Also fetch tracking timeline from Shiprocket
      const trackData = await callShiprocket('track');
      if (trackData) setTracking(trackData);

      onStatusChange();

      if (updatedShipment && updatedShipment.status !== oldStatus) {
        toast({ title: 'Status updated', description: `Shipment status changed to ${updatedShipment.status.replace(/_/g, ' ')}` });
      } else {
        toast({ title: 'Tracking refreshed', description: 'No status change detected' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = () => callShiprocket('cancel');

  const addr = order.shipping_address || {};

  const statusBadgeColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    ready_to_ship: 'bg-orange-100 text-orange-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    in_transit: 'bg-cyan-100 text-cyan-800',
    out_for_delivery: 'bg-teal-100 text-teal-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    returned: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className={cn('capitalize', statusBadgeColor[order.status])}>
            {order.status.replace(/_/g, ' ')}
          </Badge>
          {shipment && (
            <Badge variant="outline" className="capitalize">
              Shipment: {shipment.status.replace(/_/g, ' ')}
            </Badge>
          )}
        </div>
        {!['delivered', 'cancelled', 'returned'].includes(order.status) && (
          <Button size="sm" variant="destructive" onClick={handleCancel} disabled={!!loading}>
            <XCircle className="w-3 h-3 mr-1" /> Cancel Order
          </Button>
        )}
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === activeStep;
          const isDone = i < activeStep;
          return (
            <div key={step.key} className="flex items-center">
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  isActive && 'bg-primary text-primary-foreground',
                  isDone && 'bg-green-100 text-green-700',
                  !isActive && !isDone && 'bg-muted text-muted-foreground'
                )}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-border mx-1" />}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* STEP 0: Review */}
          {activeStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Customer:</span> {order.customerName}</div>
                <div><span className="text-muted-foreground">Total:</span> <span className="font-semibold">₹{Number(order.total).toLocaleString()}</span></div>
                <div><span className="text-muted-foreground">Date:</span> {new Date(order.created_at).toLocaleString()}</div>
                {order.coupon_code && <div><span className="text-muted-foreground">Coupon:</span> {order.coupon_code} (-₹{Number(order.discount).toLocaleString()})</div>}
              </div>

              {Object.keys(addr).length > 0 && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Shipping Address:</p>
                  <p>{[addr.address_line1 || addr.addressLine1, addr.address_line2 || addr.addressLine2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Items ({items.length}):</p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 rounded bg-muted/50 text-sm">
                      <div>
                        <p className="font-medium">{item.products?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">Size: {item.size} · Color: {item.color} · Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">₹{Number(item.price).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {order.status === 'pending' && (
                <Button onClick={handleAcceptOrder} disabled={loading === 'accept'} className="w-full">
                  {loading === 'accept' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Accept & Confirm Order
                </Button>
              )}
              {order.status === 'confirmed' && (
                <p className="text-sm text-muted-foreground text-center">Order confirmed. Proceed to create shipment →</p>
              )}
            </div>
          )}

          {/* STEP 1: Create Shipment */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Package Dimensions</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Length (cm)</Label>
                  <Input type="number" value={packageDims.length} onChange={(e) => setPackageDims((p) => ({ ...p, length: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label className="text-xs">Width (cm)</Label>
                  <Input type="number" value={packageDims.width} onChange={(e) => setPackageDims((p) => ({ ...p, width: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label className="text-xs">Height (cm)</Label>
                  <Input type="number" value={packageDims.height} onChange={(e) => setPackageDims((p) => ({ ...p, height: Number(e.target.value) }))} />
                </div>
                <div>
                  <Label className="text-xs">Weight (kg)</Label>
                  <Input type="number" step="0.1" value={packageDims.weight} onChange={(e) => setPackageDims((p) => ({ ...p, weight: Number(e.target.value) }))} />
                </div>
              </div>
              <Button onClick={handleCreateShipment} disabled={loading === 'create-order'} className="w-full">
                {loading === 'create-order' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />}
                Create Shipment on Shiprocket
              </Button>
            </div>
          )}

          {/* STEP 2: Select Courier */}
          {activeStep === 2 && (
            <div className="space-y-4">
              {couriers.length === 0 ? (
                <Button onClick={handleGetCouriers} disabled={loading === 'get-couriers'} className="w-full">
                  {loading === 'get-couriers' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Fetch Available Couriers
                </Button>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Available Couriers ({couriers.length})</h3>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {couriers.map((c) => (
                      <div key={c.courier_company_id} className="flex items-center justify-between p-3 rounded border border-border hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium text-sm">{c.courier_name}</p>
                          <p className="text-xs text-muted-foreground">ETA: {c.etd} ({c.estimated_delivery_days} days)</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm">₹{c.rate}</span>
                          <Button
                            size="sm"
                            onClick={() => handleAssignCourier(c.courier_company_id)}
                            disabled={loading === 'assign-courier'}
                          >
                            {loading === 'assign-courier' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Select'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Label & Manifest */}
          {activeStep === 3 && (
            <div className="space-y-4">
              {shipment?.awb_code && (
                <div className="text-sm bg-muted/50 p-3 rounded">
                  <p><span className="text-muted-foreground">AWB Code:</span> <span className="font-mono font-semibold">{shipment.awb_code}</span></p>
                  <p><span className="text-muted-foreground">Courier:</span> {shipment.courier_name}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleGenerateLabel} disabled={loading === 'generate-label'} variant="outline">
                  {loading === 'generate-label' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                  Generate Label
                </Button>
                <Button onClick={handleGenerateManifest} disabled={loading === 'generate-manifest'} variant="outline">
                  {loading === 'generate-manifest' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                  Generate Manifest
                </Button>
              </div>

              {shipment?.label_url && (
                <div className="flex gap-2">
                  <Button asChild variant="secondary" className="flex-1">
                    <a href={shipment.label_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" /> Download Label
                    </a>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const w = window.open(shipment.label_url!, '_blank');
                      setTimeout(() => w?.print(), 1000);
                    }}
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {shipment?.manifest_url && (
                <Button asChild variant="secondary" className="w-full">
                  <a href={shipment.manifest_url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" /> Download Manifest
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* STEP 4: Schedule Pickup */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Select Pickup Date</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !pickupDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {pickupDate ? format(pickupDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={pickupDate}
                    onSelect={setPickupDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Button onClick={handleSchedulePickup} disabled={loading === 'schedule-pickup'} className="w-full">
                {loading === 'schedule-pickup' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />}
                Schedule Pickup
              </Button>
            </div>
          )}

          {/* STEP 5: Tracking */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Shipment Tracking</h3>
                <Button size="sm" variant="outline" onClick={handleRefreshTracking} disabled={loading === 'refresh-tracking' || loading === 'track'}>
                  {(loading === 'refresh-tracking' || loading === 'track') ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                  Refresh Tracking
                </Button>
              </div>

              {shipment && (
                <div className="text-sm bg-muted/50 p-3 rounded space-y-1">
                  <p><span className="text-muted-foreground">AWB:</span> <span className="font-mono">{shipment.awb_code}</span></p>
                  <p><span className="text-muted-foreground">Courier:</span> {shipment.courier_name}</p>
                  {shipment.tracking_url && (
                    <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs">
                      Track on Shiprocket →
                    </a>
                  )}
                  {shipment.estimated_delivery && (
                    <p><span className="text-muted-foreground">ETA:</span> {new Date(shipment.estimated_delivery).toLocaleDateString()}</p>
                  )}
                </div>
              )}

              {tracking?.tracking_data?.shipment_track_activities && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <h4 className="text-xs font-medium text-muted-foreground">Activity Timeline</h4>
                  {tracking.tracking_data.shipment_track_activities.map((act, i) => (
                    <div key={i} className="flex gap-3 text-xs border-l-2 border-primary/30 pl-3 py-1">
                      <div className="min-w-[100px] text-muted-foreground">{new Date(act.date).toLocaleString()}</div>
                      <div>
                        <p className="font-medium">{act.status}</p>
                        <p className="text-muted-foreground">{act.activity} — {act.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Send notification manually */}
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() =>
                  sendWhatsApp('order_shipped', [
                    order.id.slice(0, 8),
                    shipment?.courier_name || 'Courier',
                    shipment?.tracking_url || '',
                  ])
                }
              >
                <MessageSquare className="w-3 h-3 mr-2" /> Send WhatsApp Update
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
