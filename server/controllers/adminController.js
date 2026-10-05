import User from "../models/User.js";
import Client from "../models/Client.js";
import Task from "../models/Task.js";

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalClients,
      totalTasks,
      completedTasks,
      activeClients,
    ] = await Promise.all([
      User.countDocuments(),
      Client.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: "completed" }),
      Client.countDocuments({ status: "active" }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalClients,
        totalTasks,
        completedTasks,
        activeClients,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};