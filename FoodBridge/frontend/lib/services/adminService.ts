import { prisma } from "@/lib/prisma";

export type AdminStats = {
  managedUsers: number;
  activeDonations: number;
  ngoVerificationQueue: number;
  incidentsFlagged: number;
};

export type AdminUserRow = {
  id: string;
  name: string;
  role: "ADMIN" | "DONOR" | "NGO" | "DELIVERY";
  city: string;
  verified: boolean;
  status: "active" | "suspended";
  totalDonations: number;
};

export type AdminDonationRow = {
  id: string;
  foodTitle: string;
  quantity: string;
  donorId: string;
  ngoId: string | null;
  pickupStatus: string | null;
  status: string;
  createdAt: Date;
  locationLat: number | null;
  locationLng: number | null;
};

export type AdminReportRow = {
  id: string;
  donationId: string;
  reportedBy: string;
  description: string;
  status: "open" | "reviewing" | "resolved";
  createdAt: Date;
};

export type AdminAnalytics = {
  totalMealsRescued: number;
  totalRestaurants: number;
  totalNgos: number;
  totalDeliveries: number;
};

async function logActivity(type: string, message: string) {
  await prisma.activityLog.create({
    data: { type, message },
  });
}

function coerceCity(user: { city: string | null; location: string | null }) {
  return String(user.city || user.location || "");
}

function parseQuantityToMeals(quantity: string) {
  const match = String(quantity || "").match(/(\d+)/);
  if (!match) return 0;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : 0;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const [managedUsers, activeDonations, ngoVerificationQueue, incidentsFlagged] = await Promise.all([
      prisma.user.count(),
      prisma.donation.count({
        where: {
          status: {
            notIn: ["DELIVERED", "delivered"],
          },
        },
      }),
      prisma.user.count({
        where: {
          role: "NGO",
          verified: false,
        },
      }),
      prisma.report.count({
        where: { status: "open" },
      }),
    ]);

    return { managedUsers, activeDonations, ngoVerificationQueue, incidentsFlagged };
  },

  async listUsers(): Promise<AdminUserRow[]> {
    const [users, donationCounts] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          role: true,
          city: true,
          location: true,
          verified: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.donation.groupBy({
        by: ["donorId"],
        _count: { _all: true },
      }),
    ]);

    const totalsByDonorId = new Map<string, number>();
    for (const row of donationCounts) {
      totalsByDonorId.set(row.donorId, row._count._all);
    }

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      city: coerceCity(user),
      verified: Boolean(user.verified),
      status: user.status,
      totalDonations: totalsByDonorId.get(user.id) ?? 0,
    }));
  },

  async verifyUser(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { verified: true, status: "active" },
      select: { id: true, name: true, role: true },
    });
    await logActivity("USER_VERIFIED", `Verified ${user.role} user ${user.name} (${user.id}).`);
    return user;
  },

  async suspendUser(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: "suspended" },
      select: { id: true, name: true, role: true },
    });
    await logActivity("USER_SUSPENDED", `Suspended ${user.role} user ${user.name} (${user.id}).`);
    return user;
  },

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, role: true } });
    if (!user) {
      return null;
    }

    await prisma.user.delete({ where: { id: userId } });
    await logActivity("USER_DELETED", `Deleted ${user.role} user ${user.name} (${user.id}).`);
    return user;
  },

  async listPendingNgos() {
    return prisma.user.findMany({
      where: { role: "NGO", verified: false },
      select: { id: true, name: true, email: true, city: true, location: true, verified: true, status: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
  },

  async approveNgo(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { verified: true, status: "active" },
      select: { id: true, name: true, role: true },
    });
    await logActivity("NGO_APPROVED", `Approved NGO ${user.name} (${user.id}).`);
    return user;
  },

  async rejectNgo(userId: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { verified: false, status: "suspended" },
      select: { id: true, name: true, role: true },
    });
    await logActivity("NGO_REJECTED", `Rejected NGO ${user.name} (${user.id}).`);
    return user;
  },

  async listDonations(): Promise<AdminDonationRow[]> {
    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        foodTitle: true,
        foodType: true,
        quantity: true,
        donorId: true,
        ngoId: true,
        pickupStatus: true,
        status: true,
        createdAt: true,
        locationLat: true,
        locationLng: true,
      },
    });

    return donations.map((donation) => ({
      id: donation.id,
      foodTitle: donation.foodTitle || donation.foodType,
      quantity: donation.quantity,
      donorId: donation.donorId,
      ngoId: donation.ngoId,
      pickupStatus: donation.pickupStatus,
      status: donation.status,
      createdAt: donation.createdAt,
      locationLat: donation.locationLat,
      locationLng: donation.locationLng,
    }));
  },

  async cancelDonation(donationId: string) {
    const donation = await prisma.donation.update({
      where: { id: donationId },
      data: { status: "cancelled" },
      select: { id: true, status: true },
    });
    await logActivity("DONATION_CANCELLED", `Cancelled donation ${donation.id}.`);
    return donation;
  },

  async assignDonationNgo(donationId: string, ngoId: string) {
    const donation = await prisma.donation.update({
      where: { id: donationId },
      data: { ngoId, status: "claimed" },
      select: { id: true, ngoId: true, status: true },
    });
    await logActivity("DONATION_ASSIGNED", `Assigned donation ${donation.id} to NGO ${ngoId}.`);
    return donation;
  },

  async listReports(): Promise<AdminReportRow[]> {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        donationId: true,
        reportedBy: true,
        description: true,
        status: true,
        createdAt: true,
      },
    });
    return reports;
  },

  async resolveReport(reportId: string) {
    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status: "resolved" },
      select: { id: true, donationId: true },
    });
    await logActivity("REPORT_RESOLVED", `Resolved report ${report.id} for donation ${report.donationId}.`);
    return report;
  },

  async getAnalytics(): Promise<AdminAnalytics> {
    const [delivered, totalRestaurants, totalNgos, totalDeliveries] = await Promise.all([
      prisma.donation.findMany({
        where: { status: { in: ["DELIVERED", "delivered"] } },
        select: { quantity: true },
      }),
      prisma.user.count({ where: { role: "DONOR" } }),
      prisma.user.count({ where: { role: "NGO" } }),
      prisma.user.count({ where: { role: "DELIVERY" } }),
    ]);

    const totalMealsRescued = delivered.reduce((sum, donation) => sum + parseQuantityToMeals(donation.quantity), 0);
    return { totalMealsRescued, totalRestaurants, totalNgos, totalDeliveries };
  },

  async listActivity(limit = 50) {
    return prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async createNotification(input: { title: string; message: string; targetRole: "DONOR" | "NGO" | "DELIVERY" | "ALL" }) {
    const notification = await prisma.notification.create({
      data: {
        title: input.title,
        message: input.message,
        targetRole: input.targetRole,
      },
    });
    await logActivity("NOTIFICATION_SENT", `Broadcasted notification "${input.title}" to ${input.targetRole}.`);
    return notification;
  },

  async createReport(input: { donationId: string; reportedBy: string; description: string }) {
    const report = await prisma.report.create({
      data: {
        donationId: input.donationId,
        reportedBy: input.reportedBy,
        description: input.description,
        status: "open",
      },
    });
    await logActivity("REPORT_CREATED", `Report created for donation ${input.donationId} by ${input.reportedBy}.`);
    return report;
  },
};

