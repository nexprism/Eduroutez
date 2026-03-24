'use client';

import * as React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { DayPicker, CaptionProps, useNavigation } from 'react-day-picker';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function YearCaption(props: CaptionProps) {
  const { displayMonth } = props;
  const { goToMonth } = useNavigation();
  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();

  const years = React.useMemo(
    () => Array.from({ length: 40 }, (_, i) => 2000 + i),
    []
  );

  const months = React.useMemo(
    () => Array.from({ length: 12 }, (_, i) => format(new Date(2020, i, 1), 'MMMM')),
    []
  );

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = Number(event.target.value);
    const newMonth = new Date(displayMonth);
    newMonth.setFullYear(newYear);
    goToMonth(newMonth);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonthIndex = Number(event.target.value);
    const newMonth = new Date(displayMonth);
    newMonth.setMonth(newMonthIndex);
    goToMonth(newMonth);
  };

  return (
    <div className="flex w-full items-center justify-center gap-2 px-8 pt-1">
      <select
        className="h-7 rounded border bg-background px-2 text-xs focus:outline-none"
        value={currentMonth}
        onChange={handleMonthChange}
        aria-label="Select month"
      >
        {months.map((month, index) => (
          <option key={month} value={index}>
            {month}
          </option>
        ))}
      </select>
      <select
        className="h-7 rounded border bg-background px-2 text-xs focus:outline-none"
        value={currentYear}
        onChange={handleYearChange}
        aria-label="Select year"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md'
        ),
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-8 w-8 p-0 font-normal aria-selected:opacity-100'
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: 'bg-accent text-accent-foreground',
        day_outside: 'text-muted-foreground opacity-50',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames
      }}
      components={{
        Caption: YearCaption,
        IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4" />
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
