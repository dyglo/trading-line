import { Header } from '@/components/Header';
import { AnalyticsChart } from '@/components/AnalyticsChart';
import { TickerTape } from '@/components/TickerTape';
import { AccountPanel } from '@/components/AccountPanel';
import { PortfolioDashboard } from '@/components/PortfolioDashboard';
import { OrdersPanel } from '@/components/OrdersPanel';
import { TradesHistory } from '@/components/TradesHistory';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_420px]">
          {/* Left Column - Main Content */}
          <div className="space-y-4 sm:space-y-6">
            <AnalyticsChart />
            <PortfolioDashboard />
            <AccountPanel />
            <TradesHistory />
          </div>

          {/* Right Column - Orders & Trades */}
          <div className="lg:sticky lg:top-24 lg:h-fit lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <OrdersPanel />
          </div>
        </div>
      </main>

      <TickerTape />
    </div>
  );
};

export default Dashboard;
