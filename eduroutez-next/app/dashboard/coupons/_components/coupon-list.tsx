"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const imagesBaseUrl = process.env.NEXT_PUBLIC_IMAGES;

type Coupon = {
  _id: string;
  title: string;
  description?: string;
  mode?: string;
  discount?: string | number;
  expiryDate?: string;
  image?: string;
  createdAt?: string;
};

type CouponListData = {
  result: Coupon[];
  totalDocuments: number;
};

type CouponListResponse = {
  success: boolean;
  message: string;
  data: CouponListData;
  error: Record<string, unknown> | null;
};

export default function CouponList() {
  const { data, isLoading, isError, refetch } = useQuery<CouponListResponse>({
    queryKey: ["coupons"],
    queryFn: async () => {
      const response = await axiosInstance.get<CouponListResponse>(`${apiUrl}/coupons`);
      return response.data;
    },
    staleTime: 5000,
  });

  const coupons = data?.data?.result ?? [];
  const total = data?.data?.totalDocuments ?? 0;

  return (
    <Card className="w-full mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">
          Coupons List {total ? `(${total})` : ""}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading coupons...</p>
        ) : isError ? (
          <p className="text-sm text-red-500">Failed to load coupons. Please try again.</p>
        ) : coupons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No coupons found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted-foreground uppercase">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Mode</th>
                  <th className="px-3 py-2">Discount (%)</th>
                  <th className="px-3 py-2">Expiry Date</th>
                  <th className="px-3 py-2">Image</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-medium">{coupon.title}</td>
                    <td className="px-3 py-2">{coupon.mode ?? "-"}</td>
                    <td className="px-3 py-2">{coupon.discount ?? "-"}</td>
                    <td className="px-3 py-2">
                      {coupon.expiryDate
                        ? new Date(coupon.expiryDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {coupon.image && imagesBaseUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${imagesBaseUrl}/${coupon.image}`}
                          alt={coupon.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">No image</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
