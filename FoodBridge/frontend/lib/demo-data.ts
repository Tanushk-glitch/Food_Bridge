import "server-only";

type UserRole = "ADMIN" | "DONOR" | "NGO" | "DELIVERY";
type UserStatus = "active" | "suspended";

export type DemoUser = {
  id: string;
  name: string;
  role: UserRole;
  city: string;
  verified: boolean;
  status: UserStatus;
  organizationName?: string;
};

export type DemoDonationStatus =
  | "POSTED"
  | "NGO_ACCEPTED"
  | "DELIVERY_ACCEPTED"
  | "PICKED_UP"
  | "DELIVERED"
  | "CANCELLED";

export type DemoDonation = {
  id: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  location: string;
  status: DemoDonationStatus;
  donorId: string;
  ngoId: string | null;
  deliveryAgentId?: string | null;
  createdAt: string;
  donor?: { name: string; email: string } | null;
  ngo?: { name: string; email: string } | null;
};

type DemoDb = {
  users: DemoUser[];
  donations: DemoDonation[];
  nextDonationNumber: number;
};

function isTruthy(value: string | undefined) {
  return String(value || "").trim().toLowerCase() === "true";
}

export function demoDataEnabled() {
  return isTruthy(process.env.DEMO_LOGIN_BYPASS) || isTruthy(process.env.DEMO_DATA_BYPASS);
}

function nowIso() {
  return new Date().toISOString();
}

function addHours(base: Date, hours: number) {
  return new Date(base.getTime() + hours * 60 * 60 * 1000);
}

function createSeedDb(): DemoDb {
  const users: DemoUser[] = [
    { id: "admin@gmail.com", name: "Admin", role: "ADMIN", city: "Bengaluru", verified: true, status: "active" },

    { id: "donor.royal@foodbridge.dev", name: "Royal Orchid Hotel", role: "DONOR", city: "Bengaluru", verified: true, status: "active" },
    { id: "donor.green@foodbridge.dev", name: "Green Leaf Catering", role: "DONOR", city: "Mumbai", verified: true, status: "active" },
    { id: "donor.bake@foodbridge.dev", name: "Bake & Bite", role: "DONOR", city: "Delhi", verified: true, status: "active" },
    { id: "donor.sunrise@foodbridge.dev", name: "Sunrise Diner", role: "DONOR", city: "Pune", verified: true, status: "active" },
    { id: "donor.spice@foodbridge.dev", name: "Spice Route Kitchen", role: "DONOR", city: "Chennai", verified: true, status: "active" },

    { id: "ngo.asha@foodbridge.dev", name: "Asha Community Kitchen", role: "NGO", city: "Bengaluru", verified: true, status: "active", organizationName: "Asha Community Kitchen" },
    { id: "ngo.seva@foodbridge.dev", name: "Seva Food Bank", role: "NGO", city: "Mumbai", verified: true, status: "active", organizationName: "Seva Food Bank" },
    { id: "ngo.hope@foodbridge.dev", name: "Hope Meal Mission", role: "NGO", city: "Delhi", verified: false, status: "active", organizationName: "Hope Meal Mission" },
    { id: "ngo.udaya@foodbridge.dev", name: "Udaya Care Trust", role: "NGO", city: "Pune", verified: true, status: "active", organizationName: "Udaya Care Trust" },
    { id: "ngo.nourish@foodbridge.dev", name: "Nourish Together", role: "NGO", city: "Chennai", verified: false, status: "active", organizationName: "Nourish Together" },

    { id: "delivery.rahul@foodbridge.dev", name: "Rahul (Delivery)", role: "DELIVERY", city: "Bengaluru", verified: true, status: "active" },
    { id: "delivery.priya@foodbridge.dev", name: "Priya (Delivery)", role: "DELIVERY", city: "Mumbai", verified: true, status: "active" },
    { id: "delivery.aman@foodbridge.dev", name: "Aman (Delivery)", role: "DELIVERY", city: "Delhi", verified: true, status: "active" },
    { id: "delivery.neha@foodbridge.dev", name: "Neha (Delivery)", role: "DELIVERY", city: "Pune", verified: true, status: "active" },
  ];

  const donors = users.filter((u) => u.role === "DONOR");
  const ngos = users.filter((u) => u.role === "NGO");
  const deliveries = users.filter((u) => u.role === "DELIVERY");

  const base = new Date();
  const locations = [
    "Koramangala, Bengaluru",
    "HSR Layout, Bengaluru",
    "Bandra West, Mumbai",
    "Andheri East, Mumbai",
    "Saket, Delhi",
    "Hauz Khas, Delhi",
    "Koregaon Park, Pune",
    "Viman Nagar, Pune",
    "Adyar, Chennai",
    "T Nagar, Chennai",
  ];

  const foods = [
    "Fresh Veg Biryani",
    "Mixed Veg Thali",
    "Idli & Sambar Packs",
    "Paneer Butter Masala + Rice",
    "Chole Kulche Boxes",
    "Fruit Salad Cups",
    "Veg Pulao Meal Trays",
    "Dal Khichdi Containers",
    "Veg Sandwiches",
    "Poha Breakfast Packs",
    "Curd Rice Boxes",
    "Rajma Chawal Boxes",
    "Upma Snack Packs",
    "Roti + Sabzi Combo",
    "Lemon Rice Trays",
  ];

  const donations: DemoDonation[] = Array.from({ length: 15 }).map((_, index) => {
    const donor = donors[index % donors.length]!;
    const ngo = ngos[index % ngos.length]!;
    const delivery = deliveries[index % deliveries.length]!;

    const id = `FDB-${String(401 + index)}`;
    const createdAt = addHours(base, -(index + 1) * 2);
    const expiryTime = addHours(createdAt, 6);

    const status: DemoDonationStatus =
      index < 6
        ? "POSTED"
        : index < 10
          ? "NGO_ACCEPTED"
          : index < 12
            ? "DELIVERY_ACCEPTED"
            : index < 14
              ? "PICKED_UP"
              : "DELIVERED";

    const ngoId = status === "POSTED" ? null : ngo.id;
    const deliveryAgentId = status === "DELIVERY_ACCEPTED" || status === "PICKED_UP" || status === "DELIVERED" ? delivery.id : null;

    return {
      id,
      foodType: foods[index % foods.length]!,
      quantity: `${(index % 7) * 6 + 18} meal boxes`,
      expiryTime: expiryTime.toISOString(),
      location: locations[index % locations.length]!,
      status,
      donorId: donor.id,
      ngoId,
      deliveryAgentId,
      createdAt: createdAt.toISOString(),
      donor: { name: donor.name, email: donor.id },
      ngo: ngoId ? { name: ngo.name, email: ngo.id } : null,
    };
  });

  return { users, donations, nextDonationNumber: 416 };
}

function getDb(): DemoDb {
  const globalAny = globalThis as unknown as { __foodbridgeDemoDb?: DemoDb };
  if (!globalAny.__foodbridgeDemoDb) {
    globalAny.__foodbridgeDemoDb = createSeedDb();
  }
  return globalAny.__foodbridgeDemoDb;
}

function findUser(id: string) {
  const db = getDb();
  return db.users.find((u) => u.id === id) || null;
}

export function listAdminUsers() {
  const db = getDb();

  return db.users
    .filter((user) => user.role !== "ADMIN" || user.id === "admin@gmail.com")
    .map((user) => {
      const totalDonations = db.donations.filter((d) => d.donorId === user.id).length;
      return {
        id: user.id,
        name: user.name,
        role: user.role,
        city: user.city,
        verified: user.verified,
        status: user.status,
        totalDonations,
      };
    });
}

export function listAdminDonations() {
  const db = getDb();
  return db.donations
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((d) => ({
      id: d.id,
      foodTitle: d.foodType,
      quantity: d.quantity,
      donorId: d.donorId,
      ngoId: d.ngoId,
      pickupStatus: d.deliveryAgentId ? d.status : null,
      status: d.status,
      createdAt: d.createdAt,
    }));
}

export function getAdminStats() {
  const db = getDb();
  const managedUsers = db.users.filter((u) => u.role !== "ADMIN").length;
  const activeDonations = db.donations.filter((d) => d.status !== "DELIVERED" && d.status !== "CANCELLED").length;
  const ngoVerificationQueue = db.users.filter((u) => u.role === "NGO" && !u.verified && u.status === "active").length;
  const incidentsFlagged = 3;

  return { managedUsers, activeDonations, ngoVerificationQueue, incidentsFlagged };
}

export function cancelDonation(donationId: string) {
  const db = getDb();
  const donation = db.donations.find((d) => d.id === donationId);
  if (!donation) return null;
  donation.status = "CANCELLED";
  return donation;
}

export function approveNgo(ngoId: string) {
  const user = findUser(ngoId);
  if (!user || user.role !== "NGO") return null;
  user.verified = true;
  return user;
}

export function rejectNgo(ngoId: string) {
  const user = findUser(ngoId);
  if (!user || user.role !== "NGO") return null;
  user.status = "suspended";
  return user;
}

export function suspendUser(userId: string) {
  const user = findUser(userId);
  if (!user || user.role === "ADMIN") return null;
  user.status = "suspended";
  return user;
}

export function deleteUser(userId: string) {
  const db = getDb();
  const index = db.users.findIndex((u) => u.id === userId);
  if (index === -1) return false;
  if (db.users[index]?.role === "ADMIN") return false;
  db.users.splice(index, 1);
  db.donations = db.donations.filter((d) => d.donorId !== userId && d.ngoId !== userId && d.deliveryAgentId !== userId);
  return true;
}

export function listOpenDonations() {
  const db = getDb();
  return db.donations.filter((d) => d.status === "POSTED");
}

export function listNgoPickupRequests() {
  const db = getDb();
  return db.donations.filter((d) => d.status !== "POSTED" && d.ngoId);
}

export function listDonationsForDonor(donorId: string) {
  const db = getDb();
  return db.donations.filter((d) => d.donorId === donorId);
}

export function acceptDonationForNgo(donationId: string, ngoId: string) {
  const db = getDb();
  const donation = db.donations.find((d) => d.id === donationId);
  const ngo = findUser(ngoId);
  if (!donation || !ngo || ngo.role !== "NGO") return null;
  donation.ngoId = ngo.id;
  donation.ngo = { name: ngo.name, email: ngo.id };
  donation.status = "NGO_ACCEPTED";
  return donation;
}

export function assignDeliveryAgent(donationId: string, deliveryAgentId: string) {
  const db = getDb();
  const donation = db.donations.find((d) => d.id === donationId);
  const delivery = findUser(deliveryAgentId);
  if (!donation || !delivery || delivery.role !== "DELIVERY") return null;
  donation.deliveryAgentId = delivery.id;
  donation.status = "DELIVERY_ACCEPTED";
  return donation;
}

export function markPickup(donationId: string) {
  const db = getDb();
  const donation = db.donations.find((d) => d.id === donationId);
  if (!donation) return null;
  donation.status = "PICKED_UP";
  return donation;
}

export function markDelivered(donationId: string) {
  const db = getDb();
  const donation = db.donations.find((d) => d.id === donationId);
  if (!donation) return null;
  donation.status = "DELIVERED";
  return donation;
}

export function listDeliveryRequests() {
  const db = getDb();
  return db.donations.filter((d) => d.status === "NGO_ACCEPTED" || d.status === "DELIVERY_ACCEPTED" || d.status === "PICKED_UP");
}

export function createDonation(input: {
  donorId: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  location: string;
}) {
  const db = getDb();
  const donor = findUser(input.donorId);
  if (!donor || donor.role !== "DONOR") return null;

  const createdAt = nowIso();
  const id = `FDB-${String(db.nextDonationNumber)}`;
  db.nextDonationNumber += 1;

  const donation: DemoDonation = {
    id,
    foodType: input.foodType,
    quantity: input.quantity,
    expiryTime: input.expiryTime,
    location: input.location,
    status: "POSTED",
    donorId: donor.id,
    ngoId: null,
    deliveryAgentId: null,
    createdAt,
    donor: { name: donor.name, email: donor.id },
    ngo: null,
  };

  db.donations.unshift(donation);
  return donation;
}

export function getDemoPersonaEmail(role: "admin" | "donor" | "ngo" | "delivery") {
  if (role === "admin") return "admin@gmail.com";
  if (role === "ngo") return "ngo.asha@foodbridge.dev";
  if (role === "delivery") return "delivery.rahul@foodbridge.dev";
  return "donor.royal@foodbridge.dev";
}
