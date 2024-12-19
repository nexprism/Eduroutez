'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import axiosInstance from '@/lib/axios';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
// import { useTransition } from 'react';
import { toast } from 'sonner';
export function UserNav() {
  // const { data: session } = useSession();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // const [startTransition] = useTransition();
  const router = useRouter();
  const mutation: any = useMutation({
    mutationFn: async () => {
      try {
        const response = await axiosInstance.post(`${apiUrl}/logout`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return response.data;
      } catch (error: any) {
        // Handle error based on axios structure
        const errorMessage =
          error.response?.data?.message || 'Failed to logout';
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      toast.success('Signed Out Successfully!');

      // Redirect to dashboard
      router.push('/');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to logout');
    }
  });

  const logout = () => {
    mutation.mutate();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={'session.user?.image'}
              alt={'session.user?.name'}
            />
            <AvatarFallback>{'R'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{'Rahil A.'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {'rahil@gmail.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        {/* <DropdownMenuSeparator /> */}
        {/* <DropdownMenuGroup>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Settings
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>New Team</DropdownMenuItem>
        </DropdownMenuGroup> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
