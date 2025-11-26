// Stock prices as of November 25, 2024
const STOCK_PRICES_DOLLAR = {
  'AAPL': 229.87,
  'GOOGL': 172.37,
  'MSFT': 415.49,
  'TSLA': 345.16,
  'AMZN': 197.12,
  'NVDA': 140.15,
  'META': 563.33,
  'NFLX': 871.32,
  'ORCL': 187.84,
  'CRM': 325.67,
  'ADBE': 494.23,
  'INTC': 24.35,
  'AMD': 134.78,
  'UBER': 71.23,
  'SPOT': 456.89,
  'PYPL': 87.45,
  'SQ': 78.92,
  'SHOP': 112.34,
  'ZOOM': 89.67,
  'DOCU': 67.89
};

const STOCK_PRICES = {
  'AAPL': 20545,
  'GOOGL': 15408,
  'MSFT': 37112,
  'TSLA': 30820,
  'AMZN': 17605,
  'NVDA': 12508,
  'META': 50293,
  'NFLX': 77855,
  'ORCL': 16784,
  'CRM': 29070,
  'ADBE': 44117,
  'INTC': 2175,
  'AMD': 12040,
  'UBER': 6360,
  'SPOT': 40780,
  'PYPL': 7808,
  'SQ': 7050,
  'SHOP': 10035,
  'ZOOM': 8000,
  'DOCU': 6060
};

// Gold rate in INR per gram
const GOLD_RATE = 12677;

const DEFAULT_STOCK_PRICE = 10000;

// Get current gold price with fluctuation
const getCurrentGoldPrice = () => {
  const fluctuation = Math.sin(Date.now() / 86400000) * 0.05; // ±5% daily fluctuation
  return GOLD_RATE * (1 + fluctuation);
};

// Investment profit calculation based on time held and type
const calculateInvestmentProfit = (amount, investmentType, daysHeld) => {
  if (investmentType === 'Gold') {
    const currentGoldPrice = getCurrentGoldPrice();
    const goldProfit = (amount / GOLD_RATE) * (currentGoldPrice - GOLD_RATE);
    return goldProfit;
  }
  
  const profitRates = {
    'Index Fund': 0.08,
    'Mutual Fund': 0.06,
    'Bond': 0.04,
    'ETF': 0.07,
    'Real Estate': 0.05,
    'Crypto': 0.15
  };
  
  const annualRate = profitRates[investmentType] || 0.05;
  const dailyRate = annualRate / 365;
  const profit = amount * dailyRate * daysHeld;
  
  // Add some random variation (±20%)
  const variation = (Math.random() - 0.5) * 0.4;
  return profit * (1 + variation);
};

module.exports = {
  STOCK_PRICES,
  DEFAULT_STOCK_PRICE,
  GOLD_RATE,
  getCurrentGoldPrice,
  calculateInvestmentProfit
};