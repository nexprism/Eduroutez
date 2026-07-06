import { StatusCodes } from "http-status-codes";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import User from "../models/User.js";
import Institute from "../models/Institute.js";
import bcrypt from "bcrypt";
import randomstring from "randomstring";
import { sendEmail } from "../utils/Email/email.js";
import { STAFF_PERMISSIONS } from "../config/staff-permissions.js";

export const createStaff = async (req, res) => {
  try {
    const instituteUser = req.user;
    if (!instituteUser || instituteUser.role !== 'institute') {
      return res.status(403).json({ success: false, message: 'Only institute admin can create staff' });
    }

    const { email, name, subRole, password } = req.body;
    if (!email || !name || !subRole || !password) {
      return res.status(400).json({ success: false, message: 'email, name, subRole, and password are required' });
    }

    if (!STAFF_PERMISSIONS[subRole]) {
      return res.status(400).json({ success: false, message: 'Invalid subRole' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const staff = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'institute_staff',
      subRole,
      instituteId: instituteUser._id,
      is_verified: true,
    });

    const staffObj = staff.toObject();
    delete staffObj.password;

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Staff member created successfully',
      data: staffObj,
      err: {}
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: {}, err: error });
  }
};

export const getStaff = async (req, res) => {
  try {
    const instituteUser = req.user;
    if (instituteUser.role !== 'institute') {
      return res.status(403).json({ success: false, message: 'Only institute admin can view staff' });
    }

    const staffList = await User.find({
      role: 'institute_staff',
      instituteId: instituteUser._id
    }).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Staff list fetched successfully',
      data: staffList,
      err: {}
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: {}, err: error });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const instituteUser = req.user;
    if (instituteUser.role !== 'institute') {
      return res.status(403).json({ success: false, message: 'Only institute admin can update staff' });
    }

    const { id } = req.params;
    const staff = await User.findOne({ _id: id, role: 'institute_staff', instituteId: instituteUser._id });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const { name, subRole, password } = req.body;
    if (name) staff.name = name;
    if (subRole) {
      if (!STAFF_PERMISSIONS[subRole]) {
        return res.status(400).json({ success: false, message: 'Invalid subRole' });
      }
      staff.subRole = subRole;
    }
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      staff.password = bcrypt.hashSync(password, salt);
    }

    await staff.save();
    const staffObj = staff.toObject();
    delete staffObj.password;

    return res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      data: staffObj,
      err: {}
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: {}, err: error });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const instituteUser = req.user;
    if (instituteUser.role !== 'institute') {
      return res.status(403).json({ success: false, message: 'Only institute admin can delete staff' });
    }

    const { id } = req.params;
    const staff = await User.findOneAndDelete({ _id: id, role: 'institute_staff', instituteId: instituteUser._id });
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully',
      data: {},
      err: {}
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: {}, err: error });
  }
};

export const getStaffPermissions = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'institute_staff') {
      return res.status(403).json({ success: false, message: 'Only staff can access this' });
    }

    const instituteId = user.instituteId;
    const institute = await Institute.findById(instituteId);
    const customPerms = institute?.staffPermissions?.get?.(user.subRole) || STAFF_PERMISSIONS[user.subRole]?.allowedModules || [];

    return res.status(200).json({
      success: true,
      message: 'Permissions fetched successfully',
      data: { subRole: user.subRole, allowedModules: customPerms },
      err: {}
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: {}, err: error });
  }
};

export const getInstituteStaffPermissions = async (req, res) => {
  try {
    const instituteUser = req.user;
    if (instituteUser.role !== 'institute') {
      return res.status(403).json({ success: false, message: 'Only institute admin can manage permissions' });
    }

    const institute = await Institute.findById(instituteUser._id);
    const permissions = institute?.staffPermissions?.toJSON() || {};

    return res.status(200).json({
      success: true,
      message: 'Permissions fetched successfully',
      data: permissions,
      err: {}
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: {}, err: error });
  }
};

export const updateInstituteStaffPermissions = async (req, res) => {
  try {
    const instituteUser = req.user;
    if (instituteUser.role !== 'institute') {
      return res.status(403).json({ success: false, message: 'Only institute admin can manage permissions' });
    }

    const { permissions } = req.body;
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({ success: false, message: 'permissions object is required' });
    }

    const validRoles = ['admin', 'admissions', 'marketing', 'hod'];
    const allModules = Object.values(STAFF_PERMISSIONS).flatMap(p => p.allowedModules);
    const uniqueModules = [...new Set(allModules)];

    for (const [role, modules] of Object.entries(permissions)) {
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: `Invalid role: ${role}` });
      }
      if (!Array.isArray(modules)) {
        return res.status(400).json({ success: false, message: `Modules for ${role} must be an array` });
      }
      for (const mod of modules) {
        if (!uniqueModules.includes(mod)) {
          return res.status(400).json({ success: false, message: `Invalid module: ${mod}` });
        }
      }
    }

    const institute = await Institute.findById(instituteUser._id);
    if (!institute) {
      return res.status(404).json({ success: false, message: 'Institute not found' });
    }

    institute.staffPermissions = permissions;
    await institute.save();

    return res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      data: permissions,
      err: {}
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: {}, err: error });
  }
};
