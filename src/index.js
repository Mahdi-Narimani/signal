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
    const res = await axios.get<MarketData>(`https://Api.BrsApi.ir/Market/Gold_Currency.php?key=${API_KEY}`);
    return res.data;
};

app.post("/notification", (req, res) => {
    const { title, content } = req.body;

    exec(`termux-notification --title "${title}" --content "${content}"`, (error) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
            });
        }

        res.json({
            success: true,
        });
    });
});

app.get("/", async (req: Request, res: Response) => {
    const data = await fetchingData();

    res.send(data);
});

app.listen(port, () => {
    console.log(`Starting Server on http://127.0.0.1:${port}`);
});
