import Client from "../models/Client.js";

// GET /api/clients
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// GET /api/clients/:id
export const getClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    res.status(200).json({
      success: true,
      client,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// POST /api/clients
export const createClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      status,
      notes,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Client name is required.",
      });
    }

    const client = await Client.create({
      name,
      email,
      phone,
      company,
      status,
      notes,

      // owner bilgisi frontend'den GELMİYOR.
      // JWT ile doğrulanmış kullanıcıdan geliyor.
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      client,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// PUT /api/clients/:id
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    const allowedFields = [
      "name",
      "email",
      "phone",
      "company",
      "status",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        client[field] = req.body[field];
      }
    });

    const updatedClient = await client.save();

    res.status(200).json({
      success: true,
      client: updatedClient,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// DELETE /api/clients/:id
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    await client.deleteOne();

    res.status(200).json({
      success: true,
      message: "Client deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};