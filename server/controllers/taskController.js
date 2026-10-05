import Task from "../models/Task.js";
import Client from "../models/Client.js";

// GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      owner: req.user._id,
    })
      .populate("client", "name company email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// GET /api/tasks/:id
export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    }).populate("client", "name company email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      client,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required.",
      });
    }

    // Eğer task bir client'a bağlanacaksa,
    // o client gerçekten giriş yapan kullanıcıya mı ait?
    if (client) {
      const existingClient = await Client.findOne({
        _id: client,
        owner: req.user._id,
      });

      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: "Client not found.",
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      client: client || null,
      owner: req.user._id,
    });

    const populatedTask = await task.populate(
      "client",
      "name company email",
    );

    res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Client değiştiriliyorsa yeni client da
    // aynı kullanıcıya ait olmak zorunda.
    if (req.body.client) {
      const existingClient = await Client.findOne({
        _id: req.body.client,
        owner: req.user._id,
      });

      if (!existingClient) {
        return res.status(404).json({
          success: false,
          message: "Client not found.",
        });
      }
    }

    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
      "client",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    const updatedTask = await task.save();

    await updatedTask.populate(
      "client",
      "name company email",
    );

    res.status(200).json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};