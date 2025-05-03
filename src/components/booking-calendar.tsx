'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { format, startOfDay, parseISO, isValid } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBookingSlots, type BookingSlot } from '@/services/booking';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface BookingCalendarProps {
  tutorId: string;
}

export default function BookingCalendar({ tutorId }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [isLoadingSlots, startLoadingSlots] = useTransition();
  const [isBooking, setIsBooking] = useState(false);
  const [isClient, setIsClient] = useState(false); // State to track client mount
  const { toast } = useToast();

  useEffect(() => {
    // Set isClient to true after initial mount
    setIsClient(true);
    // Select today's date by default after component mounts on the client
    setSelectedDate(startOfDay(new Date()));
  }, []);


  useEffect(() => {
    // Ensure this effect only runs on the client after the initial date is set
    if (selectedDate && tutorId && isClient) {
      setSlots([]); // Clear previous slots
      setSelectedSlot(null); // Clear selected slot
      startLoadingSlots(async () => {
        try {
          const dateString = format(selectedDate, 'yyyy-MM-dd');
          const fetchedSlots = await getBookingSlots(tutorId, dateString);
          setSlots(fetchedSlots);
        } catch (error) {
          console.error('Error fetching booking slots:', error);
          toast({
            title: 'Error',
            description: 'Could not load available time slots. Please try again.',
            variant: 'destructive',
          });
        }
      });
    }
  }, [selectedDate, tutorId, toast, isClient]); // Add isClient dependency

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Ensure we only work with the date part, ignoring time
      setSelectedDate(startOfDay(date));
    } else {
       setSelectedDate(undefined);
    }
  };

  const handleSlotSelect = (slot: BookingSlot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };

  const handleBookingConfirm = async () => {
    if (!selectedSlot || !selectedDate) return;

    setIsBooking(true);
    try {
      // TODO: Implement actual booking API call here
      console.log('Booking confirmed:', {
        tutorId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Booking Successful!',
        description: `Your session is booked for ${format(selectedDate, 'PPP')} at ${format(parseISO(selectedSlot.startTime), 'p')}.`,
      });
      setSelectedSlot(null); // Reset selection
      // Optionally, refetch slots to show the booked one as unavailable
       startLoadingSlots(async () => {
         // Ensure selectedDate exists before formatting
         if (!selectedDate) return;
         const dateString = format(selectedDate, 'yyyy-MM-dd');
         const fetchedSlots = await getBookingSlots(tutorId, dateString);
         // Simulate booking update locally for demo purposes
         const updatedSlots = fetchedSlots.map(s => s.startTime === selectedSlot.startTime ? {...s, available: false} : s);
         setSlots(updatedSlots);
       });

    } catch (error) {
      console.error('Booking failed:', error);
      toast({
        title: 'Booking Failed',
        description: 'Could not complete your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const formatTime = (isoString: string): string => {
    const date = parseISO(isoString);
    if (!isValid(date)) return "Invalid Time";
    return format(date, 'p'); // Format like '10:00 AM'
  }

  // Memoize the current date start of day to avoid recalculating on every render
  // This calculation happens only once when the component initializes.
  const today = React.useMemo(() => startOfDay(new Date()), []);

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="flex justify-center">
          {/* Only render the Calendar component on the client side after mount */}
          {isClient ? (
             <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
              // Use the memoized 'today' value for disabling dates
              disabled={(date) => date < today}
            />
          ) : (
            // Render a skeleton or placeholder during SSR / initial render
            <Skeleton className="h-[280px] w-[280px] rounded-md border" />
          )}

        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-3">
            Available Slots for {selectedDate ? format(selectedDate, 'PPP') : 'selected date'}
          </h3>
          {isLoadingSlots ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                 <Button key={i} variant="outline" disabled className="h-10 animate-pulse bg-muted"></Button>
              ))}
            </div>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slots.map((slot) => (
                <Button
                  key={slot.startTime}
                  variant={selectedSlot?.startTime === slot.startTime ? 'default' : 'outline'}
                  disabled={!slot.available || isBooking}
                  onClick={() => handleSlotSelect(slot)}
                  className={cn(
                    !slot.available && 'text-muted-foreground line-through cursor-not-allowed',
                    'transition-all duration-150'
                  )}
                >
                  {formatTime(slot.startTime)}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              {selectedDate ? 'No available slots for this date.' : 'Please select a date.'}
            </p>
          )}

          {selectedSlot && (
            <div className="mt-6 pt-4 border-t">
              <p className="font-medium mb-3">Confirm Booking:</p>
              <p>Date: <span className="font-semibold">{selectedDate ? format(selectedDate, 'PPP') : ''}</span></p>
              <p>Time: <span className="font-semibold">{formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}</span></p>
              <Button
                className="mt-4 w-full md:w-auto"
                onClick={handleBookingConfirm}
                disabled={isBooking}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
