'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const columns: ColumnDef[] = [
  {
    header: 'ID',
    cell: ({ row }: { row: any }) => {
      console.log(row);
      return `${row.index + 1}`;
    }
  },
  {
    header: 'ACCOUNT HOLDER',
    cell: ({ row }: { row: any }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.user?.accountHolderName ?? 'N/A'}</span>
        <span className="text-sm text-muted-foreground">{row.original.userType ?? 'N/A'}</span>
      </div>
    )
  },
  {
    header: 'BANK DETAILS',
    cell: ({ row }: { row: any }) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            View Bank Details
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bank Account Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-sm">Bank Name</span>
                <span className="col-span-3">{row.original.user?.bankName ?? 'N/A'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-sm">Account No.</span>
                <span className="col-span-3">{row.original.user?.accountNumber ?? 'N/A'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-sm">IFSC Code</span>
                <span className="col-span-3">{row.original.user?.ifscCode ?? 'N/A'}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-sm">Holder Name</span>
                <span className="col-span-3">{row.original.user?.accountHolderName ?? 'N/A'}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  },
  {
    header: 'AMOUNT',
    cell: ({ row }: { row: any }) => (
      <div className="font-medium">
        ₹{row.original.requestedAmount ?? 'N/A'}
      </div>
    )
  },
  {
    header: 'PAYMENT METHOD',
    cell: ({ row }: { row: any }) => row.original.paymentMethod ?? 'N/A'
  },
  {
    header: 'STATUS',
    cell: ({ row }: { row: any }) => (
      <Badge 
        className={
          row.original.status === "PAID" 
            ? "bg-green-100 text-green-800" 
            : "bg-yellow-100 text-yellow-800"
        }
      >
        {row.original.status ?? 'N/A'}
      </Badge>
    )
  },
  {
    header: 'PAYMENT STATUS',
    cell: ({ row }: { row: any }) => (
      <Badge 
        className={
          row.original.paymentStatus === "Completed" 
            ? "bg-green-100 text-green-800" 
            : "bg-yellow-100 text-yellow-800"
        }
      >
        {row.original.paymentStatus ?? 'N/A'}
      </Badge>
    )
  },
  {
    id: 'actions',
    cell: ({ row }: { row: any }) => <CellAction data={row.original} />
  }
];