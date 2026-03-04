import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreHorizontal, UserPlus, Trash2, Edit, Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import type { Lead } from '@/types';
import api from '@/lib/api';

const toLead = (raw: any): Lead => ({
  id: raw?._id || raw?.id,
  name: raw?.name || '',
  email: raw?.email || '',
  phone: raw?.phone || '',
  status: raw?.status || 'new',
  aiScore: raw?.aiScore || 0,
  source: raw?.classification || '-',
  propertyInterest: raw?.interestProperty?.title || '',
  assignedTo: raw?.assignedAgent?._id || '',
  notes: raw?.reasoning || '',
  createdAt: raw?.createdAt || new Date().toISOString(),
  updatedAt: raw?.updatedAt || new Date().toISOString(),
});

const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-success font-bold';
  if (score >= 6) return 'text-warning font-semibold';
  return 'text-muted-foreground';
};

const LeadsPage = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigningLeadId, setAssigningLeadId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const [leadsRes, agentsRes] = await Promise.all([
          api.get('/api/leads'),
          isAdmin ? api.get('/api/auth/agents') : Promise.resolve({ data: { data: [] } }),
        ]);

        const rows = Array.isArray(leadsRes.data?.data) ? leadsRes.data.data : [];
        const agentRows = Array.isArray(agentsRes.data?.data) ? agentsRes.data.data : [];
        setLeads(rows.map(toLead));
        setAgents(agentRows);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [isAdmin]);

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const res = await api.put(`/api/leads/${leadId}`, { status });
      const updated = toLead(res.data?.data);
      setLeads((prev) => prev.map((lead) => (lead.id === leadId ? updated : lead)));
      toast({ title: 'Lead updated', description: `Status changed to ${status}.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to update lead status.', variant: 'destructive' });
    }
  };

  const assignLead = async () => {
    if (!assigningLeadId || !selectedAgentId) return;
    try {
      const res = await api.put(`/api/leads/${assigningLeadId}`, { assignedAgent: selectedAgentId });
      const updated = toLead(res.data?.data);
      setLeads((prev) => prev.map((lead) => (lead.id === assigningLeadId ? updated : lead)));
      setAssigningLeadId(null);
      setSelectedAgentId('');
      toast({ title: 'Lead assigned', description: 'Lead has been assigned to an agent.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to assign lead.', variant: 'destructive' });
    }
  };

  const handleDelete = async (leadId: string) => {
    try {
      await api.delete(`/api/leads/${leadId}`);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    } catch {
      // no-op
    }
  };

  const filtered = leads.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground text-sm mt-1">{leads.length} total leads</p>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leads..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="inspection">Inspection</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No leads found" description="Adjust your filters or wait for new leads." />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Contact</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">AI Score</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Classification</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-sm">{lead.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{lead.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-sm">{lead.email}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={lead.status} /></td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-sm ${getScoreColor(lead.aiScore)}`}>{lead.aiScore || '-'}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell text-sm text-muted-foreground">{lead.source}</td>
                    <td className="px-5 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'contacted')}>
                            <Edit className="h-4 w-4 mr-2" /> Mark Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'inspection')}>
                            <Edit className="h-4 w-4 mr-2" /> Mark Inspection
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'closed')}>
                            <Edit className="h-4 w-4 mr-2" /> Mark Closed
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${lead.email}`}><Mail className="h-4 w-4 mr-2" /> Email Lead</a>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a href={`tel:${lead.phone}`}><Phone className="h-4 w-4 mr-2" /> Call Lead</a>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem onClick={() => setAssigningLeadId(lead.id)}>
                              <UserPlus className="h-4 w-4 mr-2" /> Assign Agent
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <Dialog open={Boolean(assigningLeadId)} onOpenChange={(open) => !open && setAssigningLeadId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Lead to Agent</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent._id} value={agent._id}>
                    {agent.name} ({agent.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="w-full" onClick={assignLead} disabled={!selectedAgentId}>
              Assign Lead
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsPage;
