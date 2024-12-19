'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollableBadgeRowProps {
  badges?: string[];
  className?: string;
  children: React.ReactNode;
}

export function ScrollableBadgeRow({
  badges,
  children,
  className
}: ScrollableBadgeRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth / 2;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className={cn('relative', className)}>
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* {badges.map((badge, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="m-1 snap-start whitespace-nowrap"
          >
            {badge}
          </Badge>
        ))} */}
        {children}
      </div>
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md hover:bg-background"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
