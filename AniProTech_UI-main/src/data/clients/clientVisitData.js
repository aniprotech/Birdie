
export const clientVisitData = [
  {
    id: 1,
    title: 'Morning Visit',
    start: new Date(2024, 0, 9, 7, 30), // Jan 9, 7:30 AM
    end: new Date(2024, 0, 9, 8, 45),   // Jan 9, 8:45 AM
    resource: {
      status: 'Completed',
      tasks: '9/9',
      medication: '0/0',
      duration: '1:15',
      provider: 'K. Reddy Pallela'
    }
  },
  {
    id: 2,
    title: 'Morning Visit',
    start: new Date(2024, 0, 10, 7, 32), // Jan 10, 7:32 AM
    end: new Date(2024, 0, 10, 8, 36),   // Jan 10, 8:36 AM
    resource: {
      status: 'Completed',
      tasks: '9/9',
      medication: '0/0',
      duration: '1:03',
      provider: 'K. Reddy Pallela'
    }
  },
  {
    id: 3,
    title: 'Morning Visit',
    start: new Date(2024, 0, 11, 7, 30), // Jan 11, 7:30 AM
    end: new Date(2024, 0, 11, 8, 30),   // Jan 11, 8:30 AM
    resource: {
      status: 'Scheduled',
      tasks: '9',
      medication: '0',
      provider: 'K. Reddy Pallela'
    }
  }
]; 

export const formattedEvents = [
  {
    id: 1,
    dayAbbr: "Mon",
    startTime: "9",
    endTime: "9:30am",
    timeGroup: "Morning",
    status: "Not started",
    tasks: "No tasks or medication",
    provider: null,
    date: "2024-01-09",

    // Additional fields for Details component
    planned: "09:00am - 09:30am",
    repeat: "Daily",
    endsOn: "Never",
    requiredCarers: 1,
    location: {
      street: "23 Main Street",
      city: "London",
      region: "Greater London",
      postcode: "SW1A 1AA",
      country: "UK"
    }
  },
  {
    id: 7,
    dayAbbr: "Thu",
    startTime: "9",
    endTime: "9:30am",
    timeGroup: "Morning",
    status: "Scheduled",
    tasks: "No tasks or medication",
    provider: null,
    date: "2024-01-10",

    planned: "09:00am - 09:30am",
    repeat: "Daily",
    endsOn: "Never",
    requiredCarers: 1,
    location: {
      street: "23 Main Street",
      city: "London",
      region: "Greater London",
      postcode: "SW1A 1AA",
      country: "UK"
    }
  }
];


export const timeGroups = [
  { label: "Anytime", displayTime: "Anytime" },
  { label: "Morning", displayTime: "06:00 - 11:00" },
  { label: "Lunchtime", displayTime: "11:00 - 14:00" },
  { label: "Afternoon", displayTime: "14:00 - 18:00" },
  { label: "Evening", displayTime: "18:00 - 22:00" },
  { label: "Night", displayTime: "22:00 - 06:00" }
];


