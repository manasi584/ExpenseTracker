
```
1. open expenseTrakcer in vs code 
2. npm i in main directory , npm i in backend directory 
2.1 Open Virtual device in android studio
2.5 In backend driectory , do npm run dev 
3. Main directory , npm start 
4. press a for running android 



$ npm start - to setup expo go app
$ brew services start mongodb-community@7.0
$ cd backend 
$ npm run dev - to start backend server 

### Usage
1. Navigate to the Invest tab
2. Tap the + icon next to "My Stocks" to add a stock
3. Enter stock details (symbol, name, quantity, purchase price)
4. View real-time profit/loss calculations
5. Pull down to refresh prices
6. Tap "Portfolio Summary" to see overall performance

```

## New Stock Portfolio Features

### Enhanced Invest Page
- **Live Stock Tracking**: Add stocks with real-time price updates
- **Profit Calculations**: Automatic calculation of gains/losses
- **Portfolio Summary**: Overview of total portfolio performance
- **Stock Management**: Add/remove individual stocks
- **Pull-to-Refresh**: Update prices with pull-to-refresh gesture

### API Endpoints
- `GET /api/stocks` - Get all user stocks with current prices
- `POST /api/stocks` - Add new stock to portfolio
- `PUT /api/stocks/:id` - Update stock details
- `DELETE /api/stocks/:id` - Remove stock from portfolio
- `GET /api/stocks/portfolio-summary` - Get portfolio performance summary

### Features
1. **Add Stocks**: Enter symbol, company name, quantity, and purchase price
2. **Live Prices**: Mock API provides realistic price variations
3. **Profit Tracking**: Real-time profit/loss calculations with percentages
4. **Portfolio Overview**: Total value, cost, and overall performance
5. **Investment Integration**: Combines with existing investment tracking