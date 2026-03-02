const express = require('express');
const router = express.Router();
const Role = require('../models/Role');

// CREATE - Tạo role mới
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Kiểm tra name đã tồn tại chưa
    const existingRole = await Role.findOne({ name, isDeleted: false });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }

    const newRole = new Role({
      name,
      description: description || ""
    });

    await newRole.save();

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: newRole
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }
    next(error);
  }
});

// READ - Lấy tất cả roles (không bao gồm đã xóa mềm)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, includeDeleted = false } = req.query;
    
    const query = includeDeleted === 'true' ? {} : { isDeleted: false };
    
    const roles = await Role.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Role.countDocuments(query);

    res.status(200).json({
      success: true,
      data: roles,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// READ - Lấy role theo ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await Role.findOne({ _id: id, isDeleted: false });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID'
      });
    }
    next(error);
  }
});

// UPDATE - Cập nhật role
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Tìm role
    const role = await Role.findOne({ _id: id, isDeleted: false });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Kiểm tra name mới có bị trùng không (nếu thay đổi name)
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name, isDeleted: false });
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Role name already exists'
        });
      }
      role.name = name;
    }

    if (description !== undefined) {
      role.description = description;
    }

    await role.save();

    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID'
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists'
      });
    }
    next(error);
  }
});

// DELETE - Xóa mềm role
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await Role.findOne({ _id: id, isDeleted: false });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    role.isDeleted = true;
    await role.save();

    res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
      data: role
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role ID'
      });
    }
    next(error);
  }
});

module.exports = router;
