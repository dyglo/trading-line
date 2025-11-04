export interface SymbolData {
  symbol: string;
  name: string;
  category: 'stocks' | 'forex' | 'crypto' | 'commodities' | 'indices';
  exchange?: string;
}

export const SYMBOLS: SymbolData[] = [
  // Major US Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'JPM', name: 'JPMorgan Chase', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'WMT', name: 'Walmart Inc.', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'MA', name: 'Mastercard Inc.', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'HD', name: 'Home Depot Inc.', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'DIS', name: 'Walt Disney Co.', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'NFLX', name: 'Netflix Inc.', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'ADBE', name: 'Adobe Inc.', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'CRM', name: 'Salesforce Inc.', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'CSCO', name: 'Cisco Systems', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'INTC', name: 'Intel Corp.', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'PYPL', name: 'PayPal Holdings', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'ORCL', name: 'Oracle Corp.', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'BA', name: 'Boeing Co.', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'NKE', name: 'Nike Inc.', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'KO', name: 'Coca-Cola Co.', category: 'stocks', exchange: 'NYSE' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', category: 'stocks', exchange: 'NASDAQ' },
  { symbol: 'MCD', name: "McDonald's Corp.", category: 'stocks', exchange: 'NYSE' },
  { symbol: 'COST', name: 'Costco Wholesale', category: 'stocks', exchange: 'NASDAQ' },

  // Major Forex Pairs
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'forex' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', category: 'forex' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'forex' },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', category: 'forex' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', category: 'forex' },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', category: 'forex' },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar', category: 'forex' },
  { symbol: 'EURGBP', name: 'Euro / British Pound', category: 'forex' },
  { symbol: 'EURJPY', name: 'Euro / Japanese Yen', category: 'forex' },
  { symbol: 'GBPJPY', name: 'British Pound / Japanese Yen', category: 'forex' },
  { symbol: 'EURCHF', name: 'Euro / Swiss Franc', category: 'forex' },
  { symbol: 'AUDJPY', name: 'Australian Dollar / Japanese Yen', category: 'forex' },
  { symbol: 'EURAUD', name: 'Euro / Australian Dollar', category: 'forex' },
  { symbol: 'EURCAD', name: 'Euro / Canadian Dollar', category: 'forex' },
  { symbol: 'GBPAUD', name: 'British Pound / Australian Dollar', category: 'forex' },
  { symbol: 'GBPCAD', name: 'British Pound / Canadian Dollar', category: 'forex' },

  // Cryptocurrencies
  { symbol: 'BTCUSD', name: 'Bitcoin', category: 'crypto' },
  { symbol: 'ETHUSD', name: 'Ethereum', category: 'crypto' },
  { symbol: 'BNBUSD', name: 'Binance Coin', category: 'crypto' },
  { symbol: 'SOLUSD', name: 'Solana', category: 'crypto' },
  { symbol: 'XRPUSD', name: 'Ripple', category: 'crypto' },
  { symbol: 'ADAUSD', name: 'Cardano', category: 'crypto' },
  { symbol: 'DOGEUSD', name: 'Dogecoin', category: 'crypto' },
  { symbol: 'MATICUSD', name: 'Polygon', category: 'crypto' },
  { symbol: 'DOTUSD', name: 'Polkadot', category: 'crypto' },
  { symbol: 'LINKUSD', name: 'Chainlink', category: 'crypto' },

  // Commodities
  { symbol: 'XAUUSD', name: 'Gold', category: 'commodities' },
  { symbol: 'XAGUSD', name: 'Silver', category: 'commodities' },
  { symbol: 'CRUDE', name: 'Crude Oil WTI', category: 'commodities' },
  { symbol: 'BRENT', name: 'Brent Crude Oil', category: 'commodities' },
  { symbol: 'NATGAS', name: 'Natural Gas', category: 'commodities' },

  // Indices
  { symbol: 'SPX', name: 'S&P 500', category: 'indices' },
  { symbol: 'DJI', name: 'Dow Jones', category: 'indices' },
  { symbol: 'NASDAQ', name: 'NASDAQ Composite', category: 'indices' },
  { symbol: 'DAX', name: 'DAX', category: 'indices' },
  { symbol: 'FTSE', name: 'FTSE 100', category: 'indices' },
];

export const getCategoryIcon = (category: SymbolData['category']) => {
  switch (category) {
    case 'stocks':
      return '📈';
    case 'forex':
      return '💱';
    case 'crypto':
      return '₿';
    case 'commodities':
      return '🏆';
    case 'indices':
      return '📊';
    default:
      return '💹';
  }
};

export const getCategoryLabel = (category: SymbolData['category']) => {
  switch (category) {
    case 'stocks':
      return 'Stocks';
    case 'forex':
      return 'Forex';
    case 'crypto':
      return 'Crypto';
    case 'commodities':
      return 'Commodities';
    case 'indices':
      return 'Indices';
    default:
      return 'Other';
  }
};
