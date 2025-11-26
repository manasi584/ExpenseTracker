const express = require('express');
const Stock = require('../models/Stock');
const User = require('../models/User');
const requestLogger = require('../../middleware/requestLogger');

const router = express.Router();
router.use(requestLogger);

// Mock stock price API (replace with real API like Alpha Vantage, Yahoo Finance, etc.)
const getStockPrice = async (symbol) => {
  // Mock prices for demo - replace with real API call
  const mockPrices = {
    'AAPL': 175.50,
    'GOOGL': 2800.25,
    'MSFT': 380.75,
    'TSLA': 245.30,
    'AMZN': 3200.80,
    'NVDA': 450.60,
    'META': 320.40,
    'NFLX': 425.90
  };
  
  // Add some random variation to simulate live prices
  const basePrice = mockPrices[symbol] || 100;
  const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
  return basePrice * (1 + variation);
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
        const currentPrice = await getStockPrice(stock.symbol);
        stock.currentPrice = currentPrice;
        stock.lastUpdated = new Date();
        await stock.save();
        
        const totalValue = stock.quantity * currentPrice;
        const totalCost = stock.quantity * stock.purchasePrice;
        const profit = totalValue - totalCost;
        const profitPercentage = ((profit / totalCost) * 100).toFixed(2);
        
        return {
          ...stock.toObject(),
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
    const { symbol, name, quantity, purchasePrice } = req.body;
    
    if (!symbol || !name || !quantity || !purchasePrice) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get current price for the stock
    const currentPrice = await getStockPrice(symbol.toUpperCase());
    
    const stock = await Stock.create({
      symbol: symbol.toUpperCase(),
      name,
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
      currentPrice,
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
    
    // Update current price
    stock.currentPrice = await getStockPrice(stock.symbol);
    stock.lastUpdated = new Date();
    
    await stock.save();
    
    const totalValue = stock.quantity * stock.currentPrice;
    const totalCost = stock.quantity * stock.purchasePrice;
    const profit = totalValue - totalCost;
    const profitPercentage = ((profit / totalCost) * 100).toFixed(2);
    
    res.json({
      ...stock.toObject(),
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
      const currentPrice = await getStockPrice(stock.symbol);
      stock.currentPrice = currentPrice;
      await stock.save();
      
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