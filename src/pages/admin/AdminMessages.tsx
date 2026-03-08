import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  unread: 'bg-accent/20 text-accent',
  read: 'bg-muted text-muted-foreground',
  responded: 'bg-green-100 text-green-700',
};

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  const fetchMessages = async () => {
    const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    setMessages((data as Message[]) || []);
  };

  useEffect(() => { fetchMessages(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else fetchMessages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Message deleted' }); fetchMessages(); }
  };

  const viewMessage = (msg: Message) => {
    setSelected(msg);
    setDetailOpen(true);
    if (msg.status === 'unread') updateStatus(msg.id, 'read');
  };

  const filtered = filter === 'all' ? messages : messages.filter((m) => m.status === filter);
  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-foreground">Messages</h1>
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount} unread</Badge>}
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader><CardTitle className="font-heading text-lg">{filtered.length} Messages</CardTitle></CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-muted-foreground font-accent text-sm">No messages.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-accent">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 pr-4">From</th>
                      <th className="pb-2 pr-4">Subject</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr key={m.id} className={`border-b border-border/50 ${m.status === 'unread' ? 'bg-accent/5' : ''}`}>
                        <td className="py-3 pr-4">
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </td>
                        <td className="py-3 pr-4">{m.subject}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[m.status] || ''}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                        <td className="py-3 flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => viewMessage(m)}><Eye className="w-3 h-3" /></Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)}><Trash2 className="w-3 h-3" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-heading">Message Details</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-4 font-accent text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">From:</span> {selected.name}</div>
                  <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
                  <div><span className="text-muted-foreground">Date:</span> {new Date(selected.created_at).toLocaleString()}</div>
                  <div>
                    <span className="text-muted-foreground">Status: </span>
                    <Select value={selected.status} onValueChange={(v) => { updateStatus(selected.id, v); setSelected({ ...selected, status: v }); }}>
                      <SelectTrigger className="w-28 h-7 inline-flex"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unread">Unread</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 font-medium">Subject</p>
                  <p>{selected.subject}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1 font-medium">Message</p>
                  <p className="whitespace-pre-wrap bg-muted/50 p-3 rounded">{selected.message}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
