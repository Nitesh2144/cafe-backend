import BusinessUser from "../models/BusinessUser.js";

export const saveFcmToken = async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        message: "User ID and token are required",
      });
    }

    // 🔥 Same device token kisi old user me ho to remove
    await BusinessUser.updateMany(
      {
        fcmToken: token,
        _id: { $ne: userId },
      },
      {
        $set: {
          fcmToken: "",
        },
      }
    );

    // Current user me token save
    const user = await BusinessUser.findByIdAndUpdate(
      userId,
      {
        $set: {
          fcmToken: token,
        },
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "FCM token saved successfully",
    });

  } catch (err) {
    console.error("SAVE FCM TOKEN ERROR =>", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const removeFcmToken = async (req, res) => {
  try {
    const { userId } = req.body;

    await BusinessUser.findByIdAndUpdate(
      userId,
      {
        $set: {
          fcmToken: "",
        },
      }
    );

    return res.json({
      success: true,
      message: "FCM token removed",
    });

  } catch (err) {
    console.error("REMOVE FCM ERROR =>", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};