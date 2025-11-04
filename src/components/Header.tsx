import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface HeaderProps {
  isLanding?: boolean;
}

export const Header = ({ isLanding = false }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (isLanding) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-primary/30 bg-gradient-to-b from-black via-black/95 to-black/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">T-Line</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleScrollToSection('features')}
              className="text-white hover:text-primary"
            >
              Features
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleScrollToSection('resources')}
              className="text-white hover:text-primary"
            >
              Resources
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleScrollToSection('pricing')}
              className="text-white hover:text-primary"
            >
              Pricing
            </Button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-transparent border-primary/30 text-white hover:bg-primary/10 hover:border-primary"
            >
              Log In
            </Button>
            <Button 
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-primary"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-black border-primary/30 !h-auto" style={{ height: 'auto', top: '0', bottom: 'auto' }}>
              <SheetHeader className="pb-4">
                <SheetTitle className="text-white">T-Line</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2">
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={() => handleScrollToSection('features')}
                  className="justify-start w-full text-white hover:text-primary hover:bg-primary/10"
                >
                  Features
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={() => handleScrollToSection('resources')}
                  className="justify-start w-full text-white hover:text-primary hover:bg-primary/10"
                >
                  Resources
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg"
                  onClick={() => handleScrollToSection('pricing')}
                  className="justify-start w-full text-white hover:text-primary hover:bg-primary/10"
                >
                  Pricing
                </Button>
                <div className="flex flex-col gap-3 pt-4 border-t border-primary/30">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-transparent border-primary/30 text-white hover:bg-primary/10 hover:border-primary"
                  >
                    Log In
                  </Button>
                  <Button 
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Sign Up
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">T-Line</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Button variant="ghost" size="sm">Markets</Button>
          <Button variant="ghost" size="sm">Portfolios</Button>
          <Button variant="ghost" size="sm">News</Button>
          <Button variant="ghost" size="sm">More</Button>
        </nav>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px] !h-auto" style={{ height: 'auto', top: '0', bottom: 'auto' }}>
            <SheetHeader className="pb-4">
              <SheetTitle>T-Line</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                size="lg"
                className="justify-start w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                Markets
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                className="justify-start w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                Portfolios
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                className="justify-start w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                News
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                className="justify-start w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                More
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
