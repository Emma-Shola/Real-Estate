import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Search } from 'lucide-react';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

type PublicProperty = {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  status: string;
};

const mapProperty = (raw: any): PublicProperty => ({
  id: raw?._id || raw?.id,
  title: raw?.title || 'Property',
  description: raw?.description || '',
  location: raw?.location || '',
  price: Number(raw?.price || 0),
  bedrooms: Number(raw?.bedrooms || 0),
  bathrooms: Number(raw?.bathrooms || 0),
  status: raw?.status || 'available',
});

const PublicListingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [properties, setProperties] = useState<PublicProperty[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await api.get('/api/properties', { params: { status: 'available', limit: 100 } });
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        setProperties(rows.map(mapProperty));
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filtered = useMemo(
    () =>
      properties.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          p.location.toLowerCase().includes(query.toLowerCase())
      ),
    [properties, query]
  );

  if (loading) return <LoadingSpinner text="Loading listings..." />;

  return (
    <div className="min-h-screen bg-background">
      <section className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl lg:text-4xl font-bold">Find Your Next Home</h1>
          <p className="text-muted-foreground">Browse available listings and contact an agent instantly.</p>
          <div className="pt-2">
            <Link to="/inquiry">
              <Button variant="outline">Contact Agent Now</Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by location or title"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((property) => (
            <article key={property.id} className="glass-card p-5 space-y-3">
              <h2 className="font-display text-lg font-semibold line-clamp-1">{property.title}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {property.location}
              </p>
              <p className="text-primary font-display text-2xl font-bold">${property.price.toLocaleString()}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BedDouble className="h-4 w-4" /> {property.bedrooms}
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="h-4 w-4" /> {property.bathrooms}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{property.description}</p>
              <Link to={`/listings/${property.id}`}>
                <Button className="w-full">View Details & Contact</Button>
              </Link>
            </article>
          ))}
        </div>

        {!filtered.length && (
          <div className="glass-card p-8 text-center text-muted-foreground">No listings found for this search.</div>
        )}
      </section>
    </div>
  );
};

export default PublicListingsPage;
