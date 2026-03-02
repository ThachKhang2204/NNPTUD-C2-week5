const express = require('express');
const router = express.Router();
const User = require('../models/User');

// CREATE - Tạo user mới
router.post('/', async (req, res, next) => {
  try {
    const { username, password, email, fullName, avatarUrl, status, role, loginCount } = req.body;

    // Validate required fields
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, and email are required'
      });
    }

    // Kiểm tra username hoặc email đã tồn tại chưa
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
      isDeleted: false
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.username === username 
          ? 'Username already exists' 
          : 'Email already exists'
      });
    }

    const newUser = new User({
      username,
      password,
      email,
      fullName: fullName || "",
      avatarUrl: avatarUrl || "https://i.sstatic.net/l60Hf.png",
      status: status !== undefined ? status : false,
      role: role || null,
      loginCount: loginCount || 0
    });

    await newUser.save();

    // Populate role information
    await newUser.populate('role');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }
    next(error);
  }
});

// ENABLE - Kích hoạt tài khoản user
router.post('/enable', async (req, res, next) => {
  try {
    const { email, username } = req.body;

    // Validate required fields
    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email and username are required'
      });
    }

    // Tìm user với email và username khớp
    const user = await User.findOne({
      email,
      username,
      isDeleted: false
    }).populate('role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or credentials do not match'
      });
    }

    // Kiểm tra nếu account đã được kích hoạt
    if (user.status === true) {
      return res.status(400).json({
        success: false,
        message: 'Account is already enabled'
      });
    }

    // Kích hoạt account
    user.status = true;
    await user.save();

    // Không trả về password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Account enabled successfully',
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
});

// DISABLE - Vô hiệu hóa tài khoản user
router.post('/disable', async (req, res, next) => {
  try {
    const { email, username } = req.body;

    // Validate required fields
    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email and username are required'
      });
    }

    // Tìm user với email và username khớp
    const user = await User.findOne({
      email,
      username,
      isDeleted: false
    }).populate('role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or credentials do not match'
      });
    }

    // Kiểm tra nếu account đã bị vô hiệu hóa
    if (user.status === false) {
      return res.status(400).json({
        success: false,
        message: 'Account is already disabled'
      });
    }

    // Vô hiệu hóa account
    user.status = false;
    await user.save();

    // Không trả về password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Account disabled successfully',
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
});

// READ - Lấy tất cả users (không bao gồm đã xóa mềm)
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, includeDeleted = false } = req.query;
    
    const query = includeDeleted === 'true' ? {} : { isDeleted: false };
    
    const users = await User.find(query)
      .populate('role')
      .select('-password') // Không trả về password
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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

// READ - Lấy user theo ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, isDeleted: false })
      .populate('role')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    next(error);
  }
});

// UPDATE - Cập nhật user
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, password, email, fullName, avatarUrl, status, role, loginCount } = req.body;

    // Tìm user
    const user = await User.findOne({ _id: id, isDeleted: false });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Kiểm tra username mới có bị trùng không (nếu thay đổi username)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username, isDeleted: false });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
      user.username = username;
    }

    // Kiểm tra email mới có bị trùng không (nếu thay đổi email)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, isDeleted: false });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      user.email = email;
    }

    // Cập nhật các trường khác
    if (password) user.password = password;
    if (fullName !== undefined) user.fullName = fullName;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (status !== undefined) user.status = status;
    if (role !== undefined) user.role = role;
    if (loginCount !== undefined && loginCount >= 0) user.loginCount = loginCount;

    await user.save();
    await user.populate('role');

    // Không trả về password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }
    next(error);
  }
});

// DELETE - Xóa mềm user
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, isDeleted: false });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isDeleted = true;
    await user.save();

    // Không trả về password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: userResponse
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    next(error);
  }
});

module.exports = router;
