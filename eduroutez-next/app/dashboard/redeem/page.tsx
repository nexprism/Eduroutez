import React from "react";

const RedeemPage: React.FC = () => {
  const redemptionHistory = [
    { id: 1, date: "2025-01-01", coins: 200, reward: "Gift Card" },
    { id: 2, date: "2025-01-05", coins: 300, reward: "Discount Voucher" },
    { id: 3, date: "2025-01-10", coins: 100, reward: "Coffee Mug" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-600">Redeem Your Coins</h1>
        <p className="text-lg text-gray-600 mt-2">
          Use your coins to unlock exciting rewards!
        </p>
      </div>

      {/* Redemption Form */}
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Available Coins: <span className="text-blue-500">1000</span>
        </h2>
        <form className="space-y-4">
          <div>
            <label
              htmlFor="coins"
              className="block text-sm font-medium text-gray-700"
            >
              Enter Coins to Redeem
            </label>
            <input
              type="number"
              id="coins"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g., 200"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
          >
            Redeem Now
          </button>
        </form>
      </div>

      {/* Redemption History */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          Redemption History
        </h2>
        <table className="w-full table-auto border-collapse border border-gray-300 text-left">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border border-gray-300">Date</th>
              <th className="px-4 py-2 border border-gray-300">Coins</th>
              <th className="px-4 py-2 border border-gray-300">Reward</th>
            </tr>
          </thead>
          <tbody>
            {redemptionHistory.map((history) => (
              <tr key={history.id} className="hover:bg-gray-100">
                <td className="px-4 py-2 border border-gray-300">
                  {history.date}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {history.coins}
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {history.reward}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RedeemPage;
