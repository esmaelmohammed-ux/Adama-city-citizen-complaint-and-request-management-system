import Department from '../models/Department.js';
import { toClient, toClientList } from '../utils/toClient.js';

export async function listDepartments(req, res, next) {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ success: true, departments: toClientList(departments) });
  } catch (err) {
    next(err);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const { name, description } = req.body;
    const department = await Department.create({
      name,
      description: description || '',
      isActive: true,
    });

    res.status(201).json({ success: true, department: toClient(department) });
  } catch (err) {
    next(err);
  }
}
