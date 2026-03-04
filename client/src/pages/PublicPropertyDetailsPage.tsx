import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BedDouble, Bath, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

type PropertyDetails = {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
};

const mapProperty = (raw: any): PropertyDetails => ({
  id: raw?._id || raw?.id,
  title: raw?.title || 'Property',
  description: raw?.description || '',
  location: raw?.location || '',
  price: Number(raw?.price || 0),
  bedrooms: Number(raw?.bedrooms || 0),
  bathrooms: Number(raw?.bathrooms || 0),
});

const PublicPropertyDetailsPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    budget: '',
    message: '',
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/api/properties/${id}`);
        setProperty(mapProperty(res.data?.data));
      } catch {
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!property) return;

    try {
      setSubmitting(true);
      await api.post('/api/leads/public', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        budget: form.budget ? Number(form.budget) : undefined,
        preferredLocation: property.location,
        message: form.message,
        interestProperty: property.id,
      });
      toast({ title: 'Inquiry sent', description: 'An agent will contact you shortly.' });
      setForm({ name: '', email: '', phone: '', budget: '', message: '' });
    } catch {
      toast({ title: 'Error', description: 'Failed to submit inquiry.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading property..." />;
  if (!property) return <div className="min-h-screen p-6">Property not found.</div>;

  return (
    <div className="min-h-screen bg-background">
      <section className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Link to="/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </Link>

        <div className="glass-card p-6 space-y-3">
          <h1 className="font-display text-3xl font-bold">{property.title}</h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {property.location}
          </p>
          <p className="text-primary text-3xl font-display font-bold">${property.price.toLocaleString()}</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {property.bedrooms} bedrooms
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" /> {property.bathrooms} bathrooms
            </span>
          </div>
          <p className="text-sm leading-6">{property.description}</p>
          <a href="#contact-agent">
            <Button>Contact Agent</Button>
          </a>
        </div>

        <form id="contact-agent" onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
          <h2 className="font-display text-xl font-semibold">Contact Agent</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => handleChange('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Budget (optional)</Label>
              <Input type="number" value={form.budget} onChange={(e) => handleChange('budget', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={form.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Tell us what you need and your timeline."
              required
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Inquiry'}
          </Button>
        </form>
      </section>
    </div>
  );
};

export default PublicPropertyDetailsPage;
