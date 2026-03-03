import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const schema = z.object({
  bedrooms: z.coerce.number().min(0).max(20),
  location: z.string().min(2).max(200),
  price: z.coerce.number().min(1),
  features: z.string().min(2).max(500),
});

type FormData = z.infer<typeof schema>;

const AIToolsPage = () => {
  const { toast } = useToast();
  const [result, setResult] = useState<{ seoDescription: string; socialCaption: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post('/api/ai/generate-description', data);
      setResult(res.data?.data || null);
      toast({ title: 'Generated!', description: 'AI descriptions are ready.' });
    } catch {
      toast({ title: 'Error', description: 'Generation failed.', variant: 'destructive' });
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-accent" /> AI Tools
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Generate property descriptions powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card p-6 space-y-5"
        >
          <h2 className="font-display font-semibold text-lg">Property Details</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="Abuja, NG" {...register('location')} />
              {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <Input type="number" placeholder="3" {...register('bedrooms')} />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" placeholder="500000" {...register('price')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features</Label>
              <Textarea placeholder="Pool, modern kitchen, gated estate..." rows={3} {...register('features')} />
              {errors.features && <p className="text-xs text-destructive">{errors.features.message}</p>}
            </div>
          </div>
          <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
            <Sparkles className="h-4 w-4" />
            {isSubmitting ? 'Generating...' : 'Generate Descriptions'}
          </Button>
        </motion.form>

        <div className="space-y-4">
          {result ? (
            <>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold">SEO Description</h3>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleCopy(result.seoDescription, 'seo')}>
                    {copied === 'seo' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'seo' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.seoDescription}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold">Social Caption</h3>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleCopy(result.socialCaption, 'social')}>
                    {copied === 'social' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied === 'social' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.socialCaption}</p>
              </motion.div>
            </>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full">
              <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-display font-semibold text-lg">Ready to generate</h3>
              <p className="text-sm text-muted-foreground mt-1">Fill in the property details and click generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIToolsPage;
