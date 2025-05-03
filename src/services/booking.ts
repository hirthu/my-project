/**
 * Represents a booking slot with start and end times.
 */
export interface BookingSlot {
  /**
   * The start time of the booking slot in ISO 8601 format.
   */
  startTime: string;
  /**
   * The end time of the booking slot in ISO 8601 format.
   */
  endTime: string;
  /**
   * Is the booking slot available?
   */
  available: boolean;
}

/**
 * Asynchronously retrieves available booking slots for a tutor.
 *
 * @param tutorId The ID of the tutor.
 * @param date The date for which to retrieve booking slots in ISO 8601 format (YYYY-MM-DD).
 * @returns A promise that resolves to an array of BookingSlot objects.
 */
export async function getBookingSlots(tutorId: string, date: string): Promise<BookingSlot[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      startTime: `${date}T09:00:00.000Z`,
      endTime: `${date}T10:00:00.000Z`,
      available: true,
    },
    {
      startTime: `${date}T10:00:00.000Z`,
      endTime: `${date}T11:00:00.000Z`,
      available: false,
    },
    {
      startTime: `${date}T11:00:00.000Z`,
      endTime: `${date}T12:00:00.000Z`,
      available: true,
    },
  ];
}
