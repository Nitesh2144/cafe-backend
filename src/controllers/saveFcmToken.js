import BusinessUser from "../models/BusinessUser.js";

export const saveFcmToken = async (req, res) => {
  try {
    const { userId, token } = req.body;

    const user = await BusinessUser.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.fcmToken = token;

    await user.save();

    res.json({
      success: true,
      message: "Token saved successfully",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error",
    });
  }
};