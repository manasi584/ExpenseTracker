const express = require('express');
const Stock = require('../models/Stock');
const User = require('../models/User');
const requestLogger = require('../../middleware/requestLogger');
const fetch = require('node-fetch');
const { STOCK_PRICES, DEFAULT_STOCK_PRICE, getCurrentGoldPrice, GOLD_RATE } = require('../../constants/stockPrices');

const router = express.Router();
router.use(requestLogger);

const USD_TO_INR = 84; // Current exchange rate

// Real stock price API using Alpha Vantage with error handling
const getStockPrice = async (symbol) => {
  try {
    const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Check for rate limit or API errors
    if (data.Information && data.Information.includes('rate limit')) {
      console.warn('Alpha Vantage rate limit exceeded, using cached price');
      return null; // Will use cached price from database
    }
    
    if (data['Global Quote'] && data['Global Quote']['05. price']) {
      const usdPrice = parseFloat(data['Global Quote']['05. price']);
      return usdPrice * USD_TO_INR; // Convert USD to INR
    }
    
    console.warn(`No price data returned for ${symbol}`);
    return null;
  } catch (error) {
    console.warn(`API error for ${symbol}:`, error.message);
    return null;
  }
};

// GET /api/stocks - Get all user stocks with current prices
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.json([]);
    }
    
    const stocks = await Stock.find({ userId: user._id });
    
    // Update current prices for all stocks
    const updatedStocks = await Promise.all(
      stocks.map(async (stock) => {
        let currentPrice;
        
        if (stock.investmentType === 'Gold') {
          currentPrice = getCurrentGoldPrice();
        } else {
          const newPrice = await getStockPrice(stock.symbol);
          currentPrice = newPrice || stock.currentPrice || STOCK_PRICES[stock.symbol];
          
          if (newPrice) {
            stock.currentPrice = currentPrice;
            stock.lastUpdated = new Date();
            await stock.save();
          }
        }
        
        const totalValue = stock.quantity * currentPrice;
        const totalCost = stock.quantity * stock.purchasePrice;
        const profit = totalValue - totalCost;
        const profitPercentage = ((profit / totalCost) * 100).toFixed(2);
        
        return {
          ...stock.toObject(),
          currentPrice,
          totalValue,
          totalCost,
          profit,
          profitPercentage
        };
      })
    );
    
    res.json(updatedStocks);
  } catch (err) {
    console.error('Error fetching stocks:', err);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

// POST /api/stocks - Add new stock
router.post('/', async (req, res) => {
  try {
    const { symbol, name, quantity, purchasePrice, investmentType } = req.body;
    
    if (!symbol || !name || !quantity || !purchasePrice) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let currentPrice;
    if (investmentType === 'Gold') {
      currentPrice = getCurrentGoldPrice();
    } else {
      const fetchedPrice = await getStockPrice(symbol.toUpperCase());
      currentPrice = fetchedPrice || STOCK_PRICES[symbol.toUpperCase()];
    }
    
    const stock = await Stock.create({
      symbol: symbol.toUpperCase(),
      name,
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
      currentPrice,
      investmentType: investmentType || 'Stock',
      userId: user._id
    });
    
    const totalValue = stock.quantity * currentPrice;
    const totalCost = stock.quantity * stock.purchasePrice;
    const profit = totalValue - totalCost;
    const profitPercentage = ((profit / totalCost) * 100).toFixed(2);
    
    res.status(201).json({
      ...stock.toObject(),
      totalValue,
      totalCost,
      profit,
      profitPercentage
    });
  } catch (err) {
    console.error('Error creating stock:', err);
    res.status(500).json({ error: 'Failed to add stock' });
  }
});

// PUT /api/stocks/:id - Update stock quantity or purchase price
router.put('/:id', async (req, res) => {
  try {
    const { quantity, purchasePrice } = req.body;
    
    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    if (quantity !== undefined) stock.quantity = parseFloat(quantity);
    if (purchasePrice !== undefined) stock.purchasePrice = parseFloat(purchasePrice);
    
    let currentPrice;
    if (stock.investmentType === 'Gold') {
      currentPrice = getCurrentGoldPrice();
    } else {
      const newPrice = await getStockPrice(stock.symbol);
      currentPrice = newPrice || stock.currentPrice;
      
      if (newPrice) {
        stock.currentPrice = currentPrice;
        stock.lastUpdated = new Date();
      }
    }
    
    await stock.save();
    
    const totalValue = stock.quantity * currentPrice;
    const totalCost = stock.quantity * stock.purchasePrice;
    const profit = totalValue - totalCost;
    const profitPercentage = ((profit / totalCost) * 100).toFixed(2);
    
    res.json({
      ...stock.toObject(),
      currentPrice,
      totalValue,
      totalCost,
      profit,
      profitPercentage
    });
  } catch (err) {
    console.error('Error updating stock:', err);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// DELETE /api/stocks/:id - Remove stock
router.delete('/:id', async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    res.json({ message: 'Stock removed successfully' });
  } catch (err) {
    console.error('Error deleting stock:', err);
    res.status(500).json({ error: 'Failed to remove stock' });
  }
});

// GET /api/stocks/portfolio-summary - Get portfolio summary
router.get('/portfolio-summary', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.json({ totalValue: 0, totalCost: 0, totalProfit: 0, profitPercentage: 0 });
    }
    
    const stocks = await Stock.find({ userId: user._id });
    
    let totalValue = 0;
    let totalCost = 0;
    
    for (const stock of stocks) {
      let currentPrice;
      
      if (stock.investmentType === 'Gold') {
        currentPrice = getCurrentGoldPrice();
      } else {
        const newPrice = await getStockPrice(stock.symbol);
        currentPrice = newPrice || stock.currentPrice || STOCK_PRICES[stock.symbol];
        
        if (newPrice) {
          stock.currentPrice = currentPrice;
          await stock.save();
        }
      }
      
      totalValue += stock.quantity * currentPrice;
      totalCost += stock.quantity * stock.purchasePrice;
    }
    
    const totalProfit = totalValue - totalCost;
    const profitPercentage = totalCost > 0 ? ((totalProfit / totalCost) * 100).toFixed(2) : 0;
    
    res.json({
      totalValue,
      totalCost,
      totalProfit,
      profitPercentage,
      stockCount: stocks.length
    });
  } catch (err) {
    console.error('Error getting portfolio summary:', err);
    res.status(500).json({ error: 'Failed to get portfolio summary' });
  }
});

module.exports = router;