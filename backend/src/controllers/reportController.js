import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import { STATUSES } from '../constants/index.js';

export async function getSummary(req, res, next) {
  try {
    const [
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      totalUsers,
      totalDepartments,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: STATUSES.PENDING }),
      Complaint.countDocuments({ status: STATUSES.IN_PROGRESS }),
      Complaint.countDocuments({ status: STATUSES.RESOLVED }),
      User.countDocuments(),
      Department.countDocuments({ isActive: true }),
    ]);

    res.json({
      success: true,
      summary: {
        totalComplaints,
        pendingComplaints,
        inProgressComplaints,
        resolvedComplaints,
        totalUsers,
        totalDepartments,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getByCategory(req, res, next) {
  try {
    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      byCategory: byCategory.map((row) => ({ category: row._id, count: row.count })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getByDepartment(req, res, next) {
  try {
    const complaintCounts = await Complaint.aggregate([
      { $match: { departmentId: { $ne: null } } },
      { $group: { _id: '$departmentId', count: { $sum: 1 } } },
    ]);

    const departments = await Department.find();
    const deptMap = Object.fromEntries(departments.map((d) => [d._id.toString(), d.name]));

    const byDepartment = complaintCounts.map((row) => {
      const key = row._id.toString();
      return {
        departmentId: key,
        departmentName: deptMap[key] || 'Unknown',
        complaints: row.count,
      };
    });

    res.json({ success: true, byDepartment });
  } catch (err) {
    next(err);
  }
}
