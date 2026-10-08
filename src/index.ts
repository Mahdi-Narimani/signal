import express, { Request, Response } from "express";
import axios from "axios";
import { exec } from "node:child_process";

interface BaseMarketItem {
    date: string;
    time: string;
    time_unix: number;
    symbol: string;
    name_en: string;
    name: string;
    unit: string;
}

interface MarketItem extends BaseMarketItem {
    price: number;
    change_value: number;
    change_percent: number;
}

interface CryptocurrencyItem extends BaseMarketItem {
    price: string;
    change_percent: number;
    market_cap: number;
    description: string;
}

interface MarketData {
    gold: MarketItem[];
    currency: MarketItem[];
    cryptocurrency: CryptocurrencyItem[];
}

const app = express();

const port = 8000;

const API_KEY = "BFBNS6GaZzfsLXNCxw4mKhkQDUVwXMmG";

app.use(express.json());

const fetchingData = async (): Promise<MarketData> => {
    const res = await axios.get<MarketData>(
        `https://Api.BrsApi.ir/Market/Gold_Currency.php?key=${API_KEY}`
    );

    return res.data;
};

app.get("/", async (req: Request, res: Response) => {
    try {
        const data = await fetchingData();

        const gold18 = data.gold.find(
            (item) => item.symbol === "IR_GOLD_18K"
        );

        const dollar = data.currency.find(
            (item) => item.symbol === "USD"
        );

        const bitcoin = data.cryptocurrency.find(
            (item) => item.symbol === "BTC"
        );

        const title = "📊 وضعیت بازار";

        const content = [
            gold18
                ? `🥇 طلا 18 عیار: ${gold18.price.toLocaleString()} ${gold18.unit}`
                : "",

            dollar
                ? `💵 دلار: ${dollar.price.toLocaleString()} ${dollar.unit}`
                : "",

            bitcoin
                ? `₿ بیت‌کوین: ${Number(bitcoin.price).toLocaleString()} ${bitcoin.unit}`
                : "",
        ]
            .filter(Boolean)
            .join("\n");

        const command = `termux-notification --title "${title}" --content "${content}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("Notification error:", error);

                return res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }

            res.json({
                success: true,
                notification: {
                    title,
                    content,
                },
            });
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to fetch market data",
        });
    }
});

app.listen(port, () => {
    console.log(
        `Starting Server on http://127.0.0.1:${port}`
    );
});