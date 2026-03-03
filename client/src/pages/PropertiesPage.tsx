import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, MapPin, Bed, Bath, Maximize, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import type { Property } from '@/types';
import api from '@/lib/api';

const toProperty = (raw: any): Property => ({
  id: raw?._id || raw?.id,
  title: raw?.title || '',
  description: raw?.description || '',
  location: raw?.location || '',
  price: raw?.price || 0,
  status: raw?.status || 'available',
  bedrooms: raw?.bedrooms || 0,
  bathrooms: raw?.bathrooms || 0,
  area: raw?.area || 0,
  images: raw?.images || [],
  features: raw?.features || [],
  agentId: raw?.assignedAgent?._id || '',
  createdAt: raw?.createdAt || new Date().toISOString(),
  updatedAt: raw?.updatedAt || new Date().toISOString(),
});

const PropertiesPage = () => {
  const { isAdmin } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/api/properties');
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        setProperties(rows.map(toProperty));
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleDelete = async (propertyId: string) => {
    try {
      await api.delete(`/api/properties/${propertyId}`);
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    } catch {
      // no-op
    }
  };

  const filtered = properties.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground text-sm mt-1">{properties.length} total properties</p>
        </div>
        <Link to="/properties/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        </Link>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search properties..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="rented">Rented</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No properties found" description="Try adjusting your filters or add a new property." action={<Link to="/properties/new"><Button size="sm">Add Property</Button></Link>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((property, i) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              <div className="h-48 bg-gradient-to-br from-primary/5 to-accent/10 flex items-center justify-center relative">
                <MapPin className="h-12 w-12 text-muted-foreground/30" />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={property.status} />
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="p-5 space-y-3">
                <Link to={`/properties/${property.id}`} className="font-display font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                  {property.title}
                </Link>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" /> {property.location}
                </p>
                <p className="font-display text-xl font-bold text-primary">${property.price.toLocaleString()}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border">
                  <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {property.bedrooms}</span>
                  <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms}</span>
                  <span className="flex items-center gap-1"><Maximize className="h-4 w-4" /> {property.area || 0} sqft</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
