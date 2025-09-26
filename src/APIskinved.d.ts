import axios from 'axios';

/**
 * Skinvend API
 * Full documentation: https://skinvend.io/en/documentation
 */
declare class SkinvedAPI {
    /**
     * @param apiKey API key, which you can get in your personal account
     * @param secretKey Secret key, which you can get in your personal account
     * @param options Additional Configuration Options
     * @param options.baseURL Base URL API
     * @param options.resultUrl URL to redirect to when result
     * @param options.failUrl URL to redirect to on error
     * @param options.successUrl URL to redirect to on success
     * @param options.priorityGame CS (730), Dota 2 (570), Rust (252490), TF2 (440)
     * @param options.versionApi Version API
     * @param options.timeout Request timeout in milliseconds
     */
    constructor(
        apiKey: string,
        secretKey: string,
        options?: {
            baseURL?: string;
            resultUrl?: string;
            failUrl?: string;
            successUrl?: string;
            priorityGame?: number | string;
            versionApi?: string;
            timeout?: number;
        }
    );

    /**
     * Create Replenishment.
     * @param deposit_id Your unique identifier.
     * @param steam_id User's default SteamID 64. The user may switch to a different account.
     * @param trade_url User Steam Trade URL.
     * @param min_amount Minimum payment amount.
     * @returns Result object {"url", "trade_id"}.
     */
    CreateDeposit(
        deposit_id: string,
        steam_id?: string | null,
        trade_url?: string,
        min_amount?: number
    ): Promise<{ url: string; trade_id: string }>;

    /**
     * Create Offer.
     * @param deposit_id Your unique identifier.
     * @param steam_id User's default SteamID 64. The user may switch to a different account.
     * @param app_id CS (730), Dota 2 (570), Rust (252490), TF2 (440).
     * @param trade_url User Steam Trade URL.
     * @param item_array Array of items.
     * @returns Result object {"status","trade_id","level","registered_at","icon_url","bot_name","trade_steam_id","price_in_usd","total_in_project_currency","trade_code"}.
     */
    CreateOffer(
        deposit_id: string,
        steam_id?: string | null,
        app_id?: number | string,
        trade_url?: string,
        item_array?: any[]
    ): Promise<any>;

    /**
     * Replenishment Status.
     * @param trade_id trade_id or internal_id via query parameters.
     * @returns Result object {"id", "created_at", "internal_id", "steam_id", "status", "amount", "converted_amount", "multiplied_amount"}.
     */
    GetStatusDeposit(trade_id: string): Promise<any>;

    /**
     * Get List of Replenishments.
     * @param start_date Start date of the selection (unix timestamp).
     * @param end_date End date of the selection (unix timestamp).
     * @returns Array of replenishments.
     */
    GetHistoryDeposits(start_date: number, end_date: number): Promise<any>;

    /**
     * Replenishment Details.
     * @param trade_id trade_id or internal_id via query parameters.
     * @returns Result object {"game", "items": [{"id", "name", "icon_url", "price"}]}.
     */
    GetSkinsDeposit(trade_id: string): Promise<any>;

    /**
     * Project Balance.
     * @returns Balance.
     */
    GetProjectBalance(): Promise<any>;

    /**
     * Change project exchange rate.
     * @param coin_rate Project exchange rate. Must be in range from 0.6 to 1.
     */
    SetProjectRate(coin_rate: number): Promise<void>;

    /**
     * Fetching Steam inventory.
     * @param steam_id Steam ID User.
     * @param refresh If true, inventory will be refreshed.
     * @param app_id CS (730), Dota 2 (570), Rust (252490), TF2 (440).
     * @returns User inventory.
     */
    GetClientSteamInvetory(
        steam_id: string,
        refresh?: boolean,
        app_id?: number | string
    ): Promise<any>;

    /**
     * Search Skins.
     * @param app_id CS (730), Dota 2 (570), Rust (252490), TF2 (440).
     * @param id ID of the skin or an array of IDs.
     * @param name Name of the skin.
     * @returns Result object.
     */
    SearchSkins(
        app_id?: number | string,
        id?: string | null,
        name?: string | null
    ): Promise<any>;

    /**
     * Bot status check.
     * @param tradeUrl User's trade link.
     * @returns Result object.
     */
    CheckBotStatus(tradeUrl: string): Promise<any>;

    /**
     * Purchasing and Withdrawing Skin.
     * @param internal_id Your unique identifier.
     * @param partner partner (steam ID8).
     * @param partner_token Partner token.
     * @param app_id CS (730), Dota 2 (570), Rust (252490), TF2 (440).
     * @param max_price Maximum purchase cost.
     * @param item_id Item ID.
     * @param full_name Name of the skin or an array of names.
     * @returns Result object.
     */
    BuySkin(
        internal_id: string,
        partner: string,
        partner_token: string,
        app_id?: number | string,
        max_price?: number,
        item_id?: string,
        full_name?: string | string[]
    ): Promise<any>;

    /**
     * Purchase Status.
     * @param internal_ids Array of internal IDs.
     * @param trade_ids Array of trade IDs.
     * @returns Result object.
     */
    PurchaseStatus(
        internal_ids: string[],
        trade_ids: string[]
    ): Promise<any>;

    /**
     * Purchase History.
     * @param start_date Start date of the period (unix timestamp).
     * @param end_date End date of the period (unix timestamp).
     * @returns Result object {"game", "items": [{"id", "name", "icon_url", "price"}]}.
     */
    PurchaseHistory(
        start_date: number,
        end_date: number
    ): Promise<any>;
}

export = SkinvedAPI;