import { motion } from 'framer-motion';
import { Mail, Phone, Building2, Shield, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

const ProfilePage = () => {
  const { user, loading, logout } = useAuth();

  if (loading) return <LoadingSpinner />;

  const mockUser = user || {
    name: 'Alex Morgan',
    email: 'alex@estateai.com',
    role: 'admin' as const,
    agency: 'EstateAI Realty',
    phone: '+1 555-0123',
    createdAt: '2024-01-01',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl lg:text-3xl font-bold">Profile</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated overflow-hidden"
      >
        {/* Header */}
        <div className="h-28 bg-gradient-to-r from-primary to-primary/80 relative">
          <div className="absolute -bottom-10 left-6">
            <div className="h-20 w-20 rounded-2xl bg-card border-4 border-card flex items-center justify-center text-2xl font-bold font-display text-primary shadow-lg">
              {mockUser.name.charAt(0)}
            </div>
          </div>
        </div>

        <div className="pt-14 px-6 pb-6 space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold">{mockUser.name}</h2>
            <p className="text-sm text-muted-foreground capitalize">{mockUser.role}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem icon={Mail} label="Email" value={mockUser.email} />
            <InfoItem icon={Phone} label="Phone" value={mockUser.phone || 'Not set'} />
            <InfoItem icon={Building2} label="Agency" value={mockUser.agency || 'Not set'} />
            <InfoItem icon={Shield} label="Role" value={mockUser.role} />
            <InfoItem icon={Calendar} label="Joined" value={new Date(mockUser.createdAt).toLocaleDateString()} />
          </div>

          <div className="pt-4 border-t border-border">
            <Button variant="outline" onClick={logout} className="text-destructive border-destructive/20 hover:bg-destructive/5">
              Sign Out
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium capitalize">{value}</p>
    </div>
  </div>
);

export default ProfilePage;
