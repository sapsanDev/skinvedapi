# Skinved API
[![npm version](https://badge.fury.io/js/skinvedapi.svg)](https://badge.fury.io/js/skinvedapi)

Skinvend API wrapper for Node.js.  
Provides convenient methods for interacting with the [Skinvend API](https://skinvend.io/en/documentation).

## Features

- Create deposit (replenishment) requests
- Create trade offers
- Check deposit status
- Get deposit history
- Get deposit details (skins/items)
- Get project balance
- Change project exchange rate
- Fetch Steam user inventory
- Search for skins
- Check bot status by trade URL
- Purchase and withdraw skins
- Check purchase status
- Get purchase history

## Installation

```bash
npm install steamvedapi
```

## Usage

```javascript
const SkinvedAPI = require('steamvedapi');

const api = new SkinvedAPI('YOUR_API_KEY', 'YOUR_SECRET_KEY', {
  baseURL: 'https://api.skinvend.io',
  timeout: 5000
});

// Example: Get Steam inventory
api.GetClientSteamInvetory('76561198000000000', true, 730)
  .then(inventory => console.log(inventory))
  .catch(err => console.error(err));
```

## Methods

### constructor(apiKey, secretKey, options)
Initialize API client.

### CreateDeposit(deposit_id, steam_id, trade_url, min_amount)
Create a deposit request.

### CreateOffer(deposit_id, steam_id, app_id, trade_url, item_array)
Create a trade offer.

### GetStatusDeposit(trade_id)
Check deposit status.

### GetHistoryDeposits(start_date, end_date)
Get deposit history.

### GetSkinsDeposit(trade_id)
Get deposit details (skins/items).

### GetProjectBalance()
Get project balance.

### SetProjectRate(coin_rate)
Change project exchange rate.

### GetClientSteamInvetory(steam_id, refresh, app_id)
Fetch Steam user inventory.

### SearchSkins(app_id, id, name)
Search for skins.

### CheckBotStatus(tradeUrl)
Check bot status by trade URL.

### BuySkin(internal_id, partner, partner_token, app_id, max_price, item_id, full_name)
Purchase and withdraw skins.

### PurchaseStatus(internal_ids, trade_ids)
Check purchase status.

### PurchaseHistory(start_date, end_date)
Get purchase history.

## License

MIT
