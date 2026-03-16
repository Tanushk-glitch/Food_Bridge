export type DonationStatus = "Posted" | "NGO Accepted" | "Pickup Scheduled" | "Picked Up" | "Delivered" | "Expiring Soon";

export const impactStats = [
  { label: "Meals Saved", value: 48210, suffix: "+" },
  { label: "Food Waste Reduced", value: 128, suffix: " tons" },
  { label: "Partner NGOs", value: 186, suffix: "+" },
  { label: "Cities Activated", value: 24, suffix: "" }
];

export const steps = [
  {
    title: "Create your account by role",
    description: "Donors, NGOs, and delivery partners sign up with the workflow that matches how they contribute."
  },
  {
    title: "Complete onboarding details",
    description: "Capture service areas, operating windows, and trust signals before going live on the network."
  },
  {
    title: "Coordinate every handoff",
    description: "Dashboards keep listings, pickups, route updates, and community impact visible in one place."
  }
];

export const roleHighlights = [
  {
    title: "Donors",
    description: "Post surplus food in minutes and track pickup impact across every listing."
  },
  {
    title: "NGOs / Volunteers",
    description: "Review nearby donations, verify fit, and move food to communities faster."
  },
  {
    title: "Delivery Partners",
    description: "Accept route-ready pickups, update status in the field, and keep fulfillment reliable."
  }
];

export const donorStats = [
  { label: "Active Donations", value: "4", detail: "Currently open" },
  { label: "Meals Donated", value: "248", detail: "This month" },
  { label: "Pickups Scheduled", value: "3", detail: "Due today" },
  { label: "Successful Deliveries", value: "29", detail: "Completed" }
];

export const donorDonations = [
  {
    id: "FDB-401",
    foodType: "Fresh Veg Biryani",
    quantity: "42 meal boxes",
    ngoAssigned: "Asha Community Kitchen",
    preparationTime: "5:40 PM",
    expiryTime: "2026-03-14T22:30:00+05:30",
    pickupWindow: "8:15 PM - 8:50 PM",
    pickupTime: "8:20 PM",
    location: "Koramangala, Bengaluru",
    status: "Posted" as DonationStatus,
    meals: 42
  },
  {
    id: "FDB-402",
    foodType: "Bakery packs",
    quantity: "18 assorted bags",
    ngoAssigned: "CareServe Foundation",
    preparationTime: "3:10 PM",
    expiryTime: "2026-03-14T21:15:00+05:30",
    pickupWindow: "7:45 PM - 8:15 PM",
    pickupTime: "7:55 PM",
    location: "Indiranagar, Bengaluru",
    status: "Pickup Scheduled" as DonationStatus,
    meals: 64
  },
  {
    id: "FDB-403",
    foodType: "Dal, rice, and rotis",
    quantity: "30 family servings",
    ngoAssigned: "Feed Hope Collective",
    preparationTime: "6:20 PM",
    expiryTime: "2026-03-14T23:50:00+05:30",
    pickupWindow: "9:00 PM - 9:40 PM",
    pickupTime: "9:10 PM",
    location: "HSR Layout, Bengaluru",
    status: "NGO Accepted" as DonationStatus,
    meals: 90
  },
  {
    id: "FDB-404",
    foodType: "Chapati meal trays",
    quantity: "24 trays",
    ngoAssigned: "Helping Hands Trust",
    preparationTime: "1:30 PM",
    expiryTime: "2026-03-14T20:30:00+05:30",
    pickupWindow: "6:45 PM - 7:10 PM",
    pickupTime: "6:50 PM",
    location: "Bandra West, Mumbai",
    status: "Picked Up" as DonationStatus,
    meals: 90
  }
];

export const donationHistory = [
  { id: "FDB-389", date: "2026-03-12", foodType: "Pasta trays", quantity: "26 trays", recipient: "CareServe Foundation", meals: 76, status: "Delivered" as DonationStatus },
  { id: "FDB-384", date: "2026-03-08", foodType: "Wraps and fruit cups", quantity: "54 packs", recipient: "Asha Community Kitchen", meals: 54, status: "Delivered" as DonationStatus },
  { id: "FDB-378", date: "2026-02-28", foodType: "Mixed dinner buffet", quantity: "128 servings", recipient: "Feed Hope Collective", meals: 128, status: "Delivered" as DonationStatus },
  { id: "FDB-372", date: "2026-02-17", foodType: "Veg pulao", quantity: "32 meal boxes", recipient: "Helping Hands Trust", meals: 32, status: "Delivered" as DonationStatus }
];

export const ngoNearbyDonations = [
  {
    id: "NGO-101",
    title: "The Green Fork Hotel",
    foodType: "Wraps, rice bowls, fruit cups",
    distance: "1.2 km",
    meals: 55,
    window: "Pickup by 8:45 PM",
    status: "Posted" as DonationStatus,
    fit: "High fit"
  },
  {
    id: "NGO-102",
    title: "Citrus Banquet Hall",
    foodType: "Paneer curry, rotis, salad",
    distance: "2.7 km",
    meals: 120,
    window: "Pickup by 9:20 PM",
    status: "NGO Accepted" as DonationStatus,
    fit: "Medium fit"
  },
  {
    id: "NGO-103",
    title: "Harvest Suites",
    foodType: "Sandwiches and baked goods",
    distance: "3.4 km",
    meals: 34,
    window: "Pickup by 7:55 PM",
    status: "Expiring Soon" as DonationStatus,
    fit: "Urgent"
  }
];

export const distributionStats = [
  { label: "Open matches", value: "18", detail: "Nearby and ready for review" },
  { label: "People served today", value: "640", detail: "Across three community zones" },
  { label: "Volunteer teams", value: "12", detail: "6 active on evening routes" }
];

export const pipelineStages = [
  { label: "Posted", count: 18 },
  { label: "Accepted", count: 11 },
  { label: "Picked up", count: 7 },
  { label: "Delivered", count: 23 }
];

export const deliveryTasks = [
  {
    id: "RT-41",
    restaurant: "The Green Fork Hotel",
    ngo: "Asha Community Kitchen",
    route: "Koramangala -> Ejipura",
    eta: "14 min",
    vehicle: "Refrigerated van",
    status: "Ready for Pickup"
  },
  {
    id: "RT-42",
    restaurant: "Citrus Banquet Hall",
    ngo: "CareServe Foundation",
    route: "Indiranagar -> Ulsoor",
    eta: "22 min",
    vehicle: "Bike courier",
    status: "In Transit"
  },
  {
    id: "RT-43",
    restaurant: "Harvest Suites",
    ngo: "Feed Hope Collective",
    route: "HSR Layout -> Bommanahalli",
    eta: "17 min",
    vehicle: "Mini truck",
    status: "Awaiting Handoff"
  }
];

export const deliveryStats = [
  { label: "Open pickup requests", value: "9", detail: "3 urgent tasks in the next 30 minutes" },
  { label: "Average route time", value: "21 min", detail: "Optimized using clustered handoffs" },
  { label: "On-time completion", value: "94%", detail: "Across this week's delivery runs" }
];

export const adminOrganizations = [
  {
    name: "The Green Fork Hotel",
    type: "Restaurant",
    city: "Bengaluru",
    listings: 14,
    health: "Verified"
  },
  {
    name: "CareServe Foundation",
    type: "NGO",
    city: "Bengaluru",
    listings: 11,
    health: "Pending review"
  },
  {
    name: "SwiftRelief Riders",
    type: "Delivery",
    city: "Bengaluru",
    listings: 28,
    health: "Active"
  }
];

export const activeDonations = donorDonations;

export const timelineEvents = [
  { label: "Listing created", time: "7:10 PM", state: "done" },
  { label: "NGO matched", time: "7:18 PM", state: "done" },
  { label: "Driver assigned", time: "7:25 PM", state: "current" },
  { label: "Delivered", time: "Expected 8:10 PM", state: "upcoming" }
] as const;

export const chartData = [
  { day: "Mon", meals: 220, pickups: 18 },
  { day: "Tue", meals: 310, pickups: 24 },
  { day: "Wed", meals: 270, pickups: 19 },
  { day: "Thu", meals: 420, pickups: 29 },
  { day: "Fri", meals: 560, pickups: 36 },
  { day: "Sat", meals: 480, pickups: 33 },
  { day: "Sun", meals: 390, pickups: 26 }
];
