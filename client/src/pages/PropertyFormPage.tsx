import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const schema = z.object({
  title: z.string().min(3).max(200),
  type: z.string().min(2).max(100),
  location: z.string().min(2).max(200),
  price: z.coerce.number().min(1),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  area: z.coerce.number().min(1),
  description: z.string().max(5000).optional(),
  features: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

const PropertyFormPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const mergedDescription = [data.description || '', data.features ? `Features: ${data.features}` : '', `Area: ${data.area} sqft`]
        .filter(Boolean)
        .join('\n\n');

      await api.post('/api/properties', {
        title: data.title,
        type: data.type,
        location: data.location,
        price: data.price,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        description: mergedDescription || 'Property listing',
      });

      toast({ title: 'Property created', description: 'Your property has been added successfully.' });
      navigate('/properties');
    } catch {
      toast({ title: 'Error', description: 'Failed to create property.', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold">Add Property</h1>
          <p className="text-muted-foreground text-sm">Fill in the details below</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)}
        className="glass-card p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label>Title</Label>
            <Input placeholder="Modern Downtown Penthouse" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Input placeholder="Apartment" {...register('type')} />
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Area (sqft)</Label>
            <Input type="number" placeholder="2000" {...register('area')} />
            {errors.area && <p className="text-xs text-destructive">{errors.area.message}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Location</Label>
            <Input placeholder="Manhattan, NY" {...register('location')} />
            {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Price ($)</Label>
            <Input type="number" placeholder="500000" {...register('price')} />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <Input type="number" placeholder="3" {...register('bedrooms')} />
          </div>
          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <Input type="number" placeholder="2" {...register('bathrooms')} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea placeholder="Describe the property..." rows={4} {...register('description')} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Features (comma separated)</Label>
            <Input placeholder="Pool, Gym, Garden" {...register('features')} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Create Property'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </motion.form>
    </div>
  );
};

export default PropertyFormPage;
