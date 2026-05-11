import { SubscriberModel } from "../models/subscriber.model.js";
import { UserModel } from "../models/user.model.js";
import { sendEmail, SubscriberWelcomeEmail } from "../utils/email.js";

export const newSubscriber = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({
      message: "Email is required",
      success: false,
    });

  try {
    // check subscriber are already subscribed data'
    const subscriber = await SubscriberModel.findOne({ email }).select("email");

    if (subscriber) {
      return res.status(409).json({
        message: "Email are already subscribed",

        success: false,
      });
    } else {
      const newSub = await SubscriberModel({ email }).save();

      await sendEmail({
        to: newSub.email,
        subject: "Welcome Subscriber",
        html: SubscriberWelcomeEmail({ email: newSub?.email }),
      });

      return res.status(201).json({
        message: "User Subscribed Successfully",
        success: true,
        subscriber: newSub,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server issue",
      success: false,
      error: error.message,
    });
  }
};

export const getAllSubscriber = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
        success: false,
      });
    }
    const user = await UserModel.findById(req.user.id).select(
      "name email phone role",
    );
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
        success: false,
      });
    }

    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch all subscribers
    const subscribers = await SubscriberModel.find()
      .select("email status createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (subscribers.length === 0) {
      return res.status(404).json({
        message: "No subscribers found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "Subscribers fetched successfully",
      success: true,
      subscribers,
      pagination: {
        total: await SubscriberModel.countDocuments(),
        page,
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server issue",
      success: false,
      error: error.message,
    });
  }
};

// update subscriber status
export const updateSubscriberStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
        success: false,
      });
    }
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
        success: false,
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const subscriber = await SubscriberModel.findById(id);
    if (!subscriber) {
      return res.status(404).json({
        message: "Subscriber not found",
        success: false,
      });
    }

    subscriber.status = status;
    await subscriber.save();

    return res.status(200).json({
      message: "Subscriber status updated successfully",
      success: true,
      subscriber,
    });
  } catch (error) {
    return res.status(500).json(
      {},
      {
        message: "Internal server issue",
        success: false,
        error: error.message,
      },
    );
  }
};

export const deleteSubscriber = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
        success: false,
      });
    }
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized. Please log in.",
        success: false,
      });
    }

    const { id } = req.params;

    const subscriber = await SubscriberModel.findByIdAndDelete(id);
    if (!subscriber) {
      return res.status(404).json({
        message: "Subscriber not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Subscriber deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server issue",
      success: false,
      error: error.message,
    });
  }
};
