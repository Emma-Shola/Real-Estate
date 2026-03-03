import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().min(5).max(20),
  propertyInterest: z.string().max(200).optional(),
  message: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

const PublicLeadForm = () => {
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/api/leads/public', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.propertyInterest
          ? `${data.message || ''}\n\nProperty interest: ${data.propertyInterest}`.trim()
          : data.message,
      });
      toast({ title: 'Thank you!', description: "We'll be in touch shortly." });
      reset();
    } catch {
      toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">EstateAI</span>
          </div>
          <h1 className="font-display text-3xl font-bold">Get in Touch</h1>
          <p className="text-muted-foreground mt-2">Interested in a property? Let us know!</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-card-elevated p-6 space-y-5">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input placeholder="Your full name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@email.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+1 555-0100" {...register('phone')} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Property Interest</Label>
            <Input placeholder="e.g., Downtown Penthouse" {...register('propertyInterest')} />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea placeholder="Tell us what you're looking for..." rows={4} {...register('message')} />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default PublicLeadForm;
