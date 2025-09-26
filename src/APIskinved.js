// Module imports
const axios = require('axios'),
      qs = require('qs'),
      { createHmac } = require('crypto');

/**
 * Skinvend API
 * Full documentation
 * @url https://skinvend.io/en/documentation.
 */

class SkinvedAPI
{
    /**
     * @param {string} apiKey - API key, which you can get in your personal account
     * @param {string} secretKey - Secret key, which you can get in your personal account
     * @param {Object} options - Additional Configuration Options
     * @param {string} [options.baseURL] - Base URL API
     * @param {string} [options.resultUrl] - URL to redirect to when result
     * @param {string} [options.failUrl] - URL to redirect to on error
     * @param {string} [options.successUrl] - URL to redirect to on success
     * @param {string} [options.priorityGame] - CS (730), Dota 2 (570), Rust (252490), TF2 (440)
     * @param {string} [options.versionApi] - Version API
     * @param {number} [options.timeout] - Request timeout in milliseconds
     */
    constructor(apiKey, secretKey, options = {})
    {
      if (!apiKey) 
        throw new Error('API key is required');

      if (!secretKey) 
        throw new Error('Secret Key is required');
      
      this.apiKey = apiKey;
      this.secretKey = secretKey;
      this.baseURL = options.baseURL || 'https://skinvend.io';
      this.resultUrl = options.resultUrl || '';
      this.failUrl = options.failUrl || '';
      this.successUrl = options.successUrl || '';
      this.priorityGame = options.priorityGame || 730;
      this.version = options.versionApi || 'v1';
      this.timeout = options.timeout || 10000;

      this.client = axios.create({
        baseURL: `${this.baseURL}/${this.version}/api`,
        timeout: this.timeout,
        headers: { apiKey: this.apiKey},
        paramsSerializer: params => 
        {
          this.client.defaults.headers['X-Timestamp'] = Date.now();
          this.client.defaults.headers['X-Signature'] = this.#generateSignature(params);
          return qs.stringify(params, { arrayFormat: 'brackets',encode: true, skipNulls: true })
        }
      });

      this.client.interceptors.response.use(response => response,
        error => 
        {
          if (error.response)
            throw new Error(`SkinVend API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
          else if (error.request)
            throw new Error('SkinVend API Error: No response received');
          else
            throw new Error(`SkinVend API Error: ${error.message}`);
        });
    }
    /**
     * Create Replenishment.
     * @param {string} deposit_id - Your unique identifier.
     * @param {string} steam_id - User's default SteamID 64. The user may switch to a different account.
     * @param {string} trade_url - User Steam Trade URL.
     * @param {float} min_amount - Minimum payment amount.
     * @return {Object} Result object {"url", "trade_id"}.
     * @url https://skinvend.io/en/documentation/create-replenishment
     */
    CreateDeposit = async (deposit_id, steam_id = null, trade_url = '', min_amount = 0.5) =>
    {
        if(!deposit_id)
            throw new Error('Deposit ID is required');

        const params = 
        {
          deposit_id,
          steam_id,
          trade_url,
          min_amount,
          result_url: this.resultUrl,
          fail_url: this.failUrl,
          success_url: this.successUrl,
          priority_game: this.priorityGame
        };

        this.client.defaults.headers['X-Timestamp'] = Date.now();
        this.client.defaults.headers['X-Signature'] = this.#generateSignature(params);

        const {data} = await this.client.post('deposit', params);

        return data;
    }
    /**
     * Create Offer.
     * @param {string} deposit_id - Your unique identifier.
     * @param {string} steam_id - User's default SteamID 64. The user may switch to a different account.
     * @param {number} app_id - CS (730), Dota 2 (570), Rust (252490), TF2 (440).
     * @param {string} trade_url - User Steam Trade URL.
     * @param {Array} item_array - Array of items
     * @return {Object} Result object {"status","trade_id","level","registered_at","icon_url","bot_name","trade_steam_id","price_in_usd","total_in_project_currency","trade_code"}.
     * @url https://skinvend.io/en/documentation/create-offer
     */
    CreateOffer = async (deposit_id, steam_id = null, app_id = this.priorityGame, trade_url = '', item_array = []) =>
    {
        if(!deposit_id)
            throw new Error('Deposit ID is required');

        const DepositParams = 
        {
          deposit_id,
          steam_id
        };

        this.client.defaults.headers['X-Timestamp'] = Date.now();
        this.client.defaults.headers['X-Signature'] = this.#generateSignature(DepositParams);

        const {data} = await this.client.post('deposit', DepositParams);

        const TradeParams = 
        {
          app_id,
          trade_id: data.trade_id,
          trade_url,
          item_array
        };

        this.client.defaults.headers['X-Timestamp'] = Date.now();
        this.client.defaults.headers['X-Signature'] = this.#generateSignature(TradeParams);

        const {result} = await this.client.post('deposit', params);

        return result.data;
    }
    /**
     * Replenishment Status.
     * @param {string} trade_id - trade_id or internal_id via query parameters.
     * @return {Object} Result object {"id", "created_at", "internal_id", "steam_id", "status", "amount", "converted_amount", "multiplied_amount"}.
     * @url https://skinvend.io/en/documentation/replenishment-status
     */
    GetStatusDeposit = async (trade_id) =>
    {
        if(!trade_id)
            throw new Error('Trade ID is required');

        const {data} = await this.client.get('deposit/status', { params:{ trade_id } });
        return data;
    }
    /**
     * Get List of Replenishments.
     * @param {Date} start_date - Start date of the selection (unix timestamp - example 1711354019 * 1000).
     * @param {Date} end_date - End date of the selection (unix timestamp - example 1711354019 * 1000).
     * @return {Object} Result object {"id", "created_at", "internal_id", "steam_id", "status", "amount", "converted_amount", "multiplied_amount"}.
     * @url https://skinvend.io/en/documentation/get-list-of-replenishments
     */
    GetHistoryDeposits = async (start_date, end_date) =>
    {
        if(!start_date || !end_date)
            throw new Error('Date (start_date | end_date) is required');

        const {data} = await this.client.get('deposit/history', { params:{ start_date, end_date } });
        return data; 
    }
    /**
     * Replenishment Details.
     * @param {string} trade_id - trade_id or internal_id via query parameters.
     * @return {Object} Result object {"game", "items": [{"id", "name", "icon_url", "price"}]}.
     * @url https://skinvend.io/en/documentation/list-of-skins-from-deposit
     */
    GetSkinsDeposit = async (trade_id) =>
    {
        if(!trade_id)
            throw new Error('Trade ID is required');

        const {data} = await this.client.get('inventory', { params:{ trade_id } });
        return data; 
    }
    /**
     * Project Balance.
     * @param {string} trade_id - trade_id or internal_id via query parameters.
     * @return {float} balance.
     * @url https://skinvend.io/en/documentation/balance-project
     */
    GetProjectBalance = async () =>
    {
      const {data} = await this.client.get('project/balance');
      return data;
    }
    /**
     * Change project exchange rate.
     * @param {float} coin_rate - Project exchange rate. Must be in range from 0.6 to 1.
     * @return {void}
     * @url https://skinvend.io/en/documentation/project-coin-rate
     */
    SetProjectRate = async (coin_rate) =>
    {
      this.client.defaults.headers['X-Timestamp'] = Date.now();
      this.client.defaults.headers['X-Signature'] = this.#generateSignature({ coin_rate });
      await this.client.patch('project/balance', { coin_rate });
    }
    /**
     * Fetching Steam inventory.
     * @param {string} steam_id - Steam ID User.
     * @param {boolean} refresh - If true, inventory will be refreshed.
     * @param {string} app_id - CS (730), Dota 2 (570), Rust (252490), TF2 (440).
     * @url https://skinvend.io/en/documentation/inventory
     */
    GetClientSteamInvetory = async (steam_id, refresh = false, app_id = this.priorityGame) =>
    {
      if(!steam_id)
        throw new Error('SteamID is required');

        const {data} = await this.client.get('inventory', {
          params:{
            app_id,
            steam_id,
            refresh
          }
        });
        return data;  
    }
    /**
     * Search Skins.
     * @param {number} app_id - CS (730), Dota 2 (570), Rust (252490), TF2 (440).
     * @param {string} id - ID of the skin or an array of IDs
     * @param {string} name - User Steam Trade URL.
     * @return {Object} Result object {}.
     * @url https://skinvend.io/en/documentation/search
     */
    SearchSkins = async (app_id = this.priorityGame, id = null, name = null) =>
    {
        if(!app_id)
            throw new Error('Deposit ID is required');

        const {data} = await this.client.get('items/search', { params:{ app_id, id, name} });
        return data;
    }
    /**
     * Bot status check.
     * @param {string} tradeUrl - User's trade link.
     * @return {Object} Result object {}.
     * @url https://skinvend.io/en/documentation/check-bot-status
     */
    CheckBotStatus = async (tradeUrl) =>
    {
        if(!tradeUrl)
            throw new Error('Deposit ID is required');

        const {data} = await this.client.get('check-user-ability', { params:{ tradeUrl } });
        return data;
    }
    /**
     * Purchasing and Withdrawing Skin.
     * @param {string} internal_id - Your unique identifier.
     * @param {string} partner - partner (steam ID8).
     * @param {string} partner_token - Partner token.
     * @param {number} app_id - CS (730), Dota 2 (570), Rust (252490), TF2 (440).
     * @param {float} max_price - Maximum purchase cost.
     * @param {string} item_id - Item ID.
     * @param {string | Array} full_name - Name of the skin or an array of names.
     * @return {Object} Result object {}.
     * @url https://skinvend.io/en/documentation/purchasing-and-withdrawing-skin
     */
    BuySkin = async (internal_id, partner, partner_token, app_id = this.priorityGame, max_price = 1, item_id = "", full_name = "") =>
    {
        if(!trade_id)
            throw new Error('Trade ID is required');

        const params = 
        {
          internal_id,
          partner,
          partner_token,
          app_id,
          max_price,
          item_id,
          full_name
        };

        this.client.defaults.headers['X-Timestamp'] = Date.now();
        this.client.defaults.headers['X-Signature'] = this.#generateSignature(params);

        const {data} = await this.client.post('withdraw/buy', params);
        return data;
    }
    /**
     * Purchase Status
     * @param {string[]} internal_ids - Start date of the selection (unix timestamp - example 1711354019 * 1000).
     * @param {string[]} trade_ids - End date of the selection (unix timestamp - example 1711354019 * 1000).
     * @return {Object} Result object {}.
     * @url https://skinvend.io/en/documentation/purchase-status
     */
    PurchaseStatus = async (internal_ids, trade_ids) =>
    {
        if(!internal_ids || !trade_ids)
            throw new Error('trade_ids | trade_ids is required');

        const {data} = await this.client.get('withdraw/status', { params:{ internal_ids, trade_ids } });
        return data; 
    }
    /**
     * Purchase History.
     * @param {Date} start_date - Start date of the period (unix timestamp - example 1711354019 * 1000).
     * @param {Date} end_date - End date of the period (unix timestamp - example 1711354019 * 1000).
     * @return {Object} Result object {"game", "items": [{"id", "name", "icon_url", "price"}]}.
     * @url https://skinvend.io/en/documentation/purchase-history
     */
    PurchaseHistory = async (start_date, end_date) =>
    {
        if(!start_date || !end_date)
            throw new Error('start_date | end_date is required');

        const {data} = await this.client.get('withdraw/history', { params:{ start_date, end_date} });
        return data; 
    }
    /**
     * API request signature
     * @param {Object} data - Any object params.
     * @url https://skinvend.io/en/documentation/auth-signature
     */
    #generateSignature = (data) => 
    {
      const timestamp = Date.now(),
            sortedData = Object.fromEntries(Object.entries(data).sort());
      let stringData = '';

      for (const value of Object.values(sortedData))
      {
          if (['array', 'object', 'undefined'].includes(typeof value) || value === null)
              continue;
          if (typeof value === 'boolean')
              stringData += value ? 'true' : 'false';
          else stringData += value;
      }
      stringData += timestamp;
      const hmac = createHmac('sha512', Buffer.from(this.secretKey));
      hmac.update(Buffer.from(stringData.toLowerCase()));
      return hmac.digest('hex');
    }
}

module.exports = SkinvedAPI;