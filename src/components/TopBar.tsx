import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const TopBar = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end gap-1 px-4 py-2 bg-purple-950/80 backdrop-blur-md border-b border-white/[0.04]">
      <LanguageSwitcher />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/profile')}
        className="text-white hover:text-white hover:bg-white/10 font-medium"
      >
        <User className="h-4 w-4 mr-1.5" />
        Profile
      </Button>
    </div>
  );
};

export default TopBar;
