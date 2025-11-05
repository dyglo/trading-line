import { useState } from "react";
import { Menu, LogOut, UserCircle2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "@/components/ui/use-toast";

interface HeaderProps {
  isLanding?: boolean;
}

export const Header = ({ isLanding = false }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const handleScrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast({
        title: "You’re signed out",
        description: "Come back soon for your next training session."
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Unable to log out",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLanding) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-primary/30 bg-gradient-to-b from-black via-black/95 to-black/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">T-Line</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleScrollToSection("features")}
              className="text-white hover:text-primary"
            >
              Features
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleScrollToSection("resources")}
              className="text-white hover:text-primary"
            >
              Resources
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleScrollToSection("pricing")}
              className="text-white hover:text-primary"
            >
              Pricing
            </Button>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-white/70">Hi, {user?.username}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/30 bg-transparent text-white hover:border-primary hover:bg-primary/10"
                  onClick={() => navigate("/dashboard")}
                >
                  Open dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary/30 bg-transparent text-white hover:border-primary hover:bg-primary/10"
                  onClick={() => navigate("/login")}
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => navigate("/register")}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:text-primary">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="!h-auto w-[300px] bg-black sm:w-[400px]"
              style={{ height: "auto", top: "0", bottom: "auto" }}
            >
              <SheetHeader className="pb-4">
                <SheetTitle className="text-white">T-Line</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleScrollToSection("features")}
                  className="w-full justify-start text-white hover:bg-primary/10 hover:text-primary"
                >
                  Features
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleScrollToSection("resources")}
                  className="w-full justify-start text-white hover:bg-primary/10 hover:text-primary"
                >
                  Resources
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleScrollToSection("pricing")}
                  className="w-full justify-start text-white hover:bg-primary/10 hover:text-primary"
                >
                  Pricing
                </Button>
                <div className="flex flex-col gap-3 border-t border-primary/30 pt-4">
                  {isAuthenticated ? (
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/dashboard");
                      }}
                    >
                      Open dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-primary/30 bg-transparent text-white hover:border-primary hover:bg-primary/10"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/login");
                        }}
                      >
                        Log in
                      </Button>
                      <Button
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate("/register");
                        }}
                      >
                        Sign up
                      </Button>
                    </>
                  )}
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
      <div className="container flex h-14 sm:h-16 items-center px-3 sm:px-4 md:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 mr-auto">
          <span className="text-lg sm:text-xl font-bold tracking-tight">T-Line</span>
        </Link>

        <nav className="hidden items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm md:flex">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="touch-manipulation">
            Dashboard
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="touch-manipulation">
            Profile
          </Button>
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs text-muted-foreground">
            <UserCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span className="hidden sm:inline">{user?.username ?? "Trader"}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 sm:gap-2 touch-manipulation"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{isLoggingOut ? "Signing out…" : "Log out"}</span>
          </Button>
        </nav>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="touch-manipulation">
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="!h-auto w-[85vw] max-w-[300px] sm:w-[400px]"
            style={{ height: "auto", top: "0", bottom: "auto" }}
          >
            <SheetHeader className="pb-4">
              <SheetTitle>T-Line</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="lg"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/dashboard");
                  setMobileMenuOpen(false);
                }}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/profile");
                  setMobileMenuOpen(false);
                }}
              >
                Profile
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full justify-start gap-2"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await handleLogout();
                }}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Signing out…" : "Log out"}
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
