'use client'
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Coins, Gift, History } from "lucide-react";
import axiosInstance from "@/lib/axios";

interface RedeemHistoryItem {
  id: number;
  Date: string;
  points: number;
  remarks: string;
}

const RedeemPage = () => {
  const [coins, setCoins] = useState("");
  const [redeemHistory, setRedeemHistory] = useState<RedeemHistoryItem[]>([]);
  const [availableCoins, setAvailableCoins] = useState(500);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchRedeemHistory();
  }, []);

  const fetchRedeemHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`${apiUrl}/redeem-history`);
      
      // Validate that response.data is an array
      if (response) {
        setRedeemHistory(response.data.data.result);
      } else {
        setRedeemHistory([]);
        setError("Invalid history data received");
      }
    } catch (error) {
      console.error("Failed to fetch redeem history:", error);
      setError("Failed to load redemption history");
      setRedeemHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`${apiUrl}/redeem-points`, { points: Number(coins) });
      setCoins("");
      setAvailableCoins(availableCoins - Number(coins));
      fetchRedeemHistory();
      console.log(response);
    } catch (error) {
      console.error("Failed to redeem points:", error);
      setError("Failed to redeem points. Please try again.");
    }
  };

  const renderHistoryTable = () => {
    if (isLoading) {
      return <div className="text-center py-4 text-purple-600">Loading history...</div>;
    }

    if (error) {
      return <div className="text-center py-4 text-red-600">No redemption history available</div>;
    }

    if (redeemHistory.length === 0) {
      return <div className="text-center py-4 text-purple-600">No redemption history available</div>;
    }

    return (
      <table className="w-full">
        <thead>
          <tr className="border-b border-purple-200">
            <th className="px-4 py-3 text-left text-sm font-medium text-purple-700">Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-purple-700">Coins</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-purple-700">Reward</th>
          </tr>
        </thead>
        <tbody>
          {redeemHistory.map((item, index) => (
            <tr 
              key={item.id} 
              className={`
                border-b border-purple-100
                ${index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}
                hover:bg-purple-100 transition-colors
              `}
            >
              <td className="px-4 py-3 text-sm text-purple-900">
                {isNaN(Date.parse(item.Date)) ? 'Invalid Date' : new Date(item.Date).toISOString().split('T')[0]}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-purple-900">
                {item.points}
              </td>
              <td className="px-4 py-3 text-sm text-purple-900">
                {item.remarks}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-900 bg-clip-text text-transparent">
          Redeem Your Coins
        </h1>
        <p className="text-lg text-purple-600">
          Transform your achievements into rewards
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2">
        <Card className="shadow-xl border-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-6 w-6 text-purple-600" />
              <span>Available Balance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-3xl font-bold text-purple-700">
              {availableCoins} Coins
            </div>
            <form onSubmit={handleRedeem} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-700">
                  Coins to Redeem
                </label>
                <Input
                  type="number"
                  value={coins}
                  onChange={(e) => setCoins(e.target.value)}
                  placeholder="Enter amount"
                  className="border-purple-200 focus:ring-purple-500"
                  min="0"
                  max={availableCoins}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
              >
                <Gift className="mr-2 h-4 w-4" />
                Redeem Now
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-6 w-6 text-purple-600" />
              <span>Redemption History</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {renderHistoryTable()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RedeemPage;