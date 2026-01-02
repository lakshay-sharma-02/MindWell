
export interface BookingEvent {
  title: string;
  description: string;
  location?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  url?: string;
  organizer?: {
    name: string;
    email: string;
  };
}

export const generateICS = (event: BookingEvent): string => {
  const formatDate = (dateStr: string) => {
    // Format: YYYYMMDDTHHmmSSZ
    return new Date(dateStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Psyche Space//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(event.startTime)}`,
    `DTEND:${formatDate(event.endTime)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location || 'Virtual'}`,
    `URL:${event.url || ''}`,
    `UID:${new Date().getTime()}-${Math.random().toString(36).substr(2, 9)}@psychespace.com`,
    `DTSTAMP:${formatDate(new Date().toISOString())}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return lines.join('\r\n');
};

export const downloadICS = (event: BookingEvent) => {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `booking-${event.startTime.split('T')[0]}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
