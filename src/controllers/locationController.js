import Location from "../models/Location.js";

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );

  return R * c;
}

export const saveLocation = async (req, res) => {
  try {
    const {
      businessCode,
      enabled,
      latitude,
      longitude,
      radius,
    } = req.body;

    const location = await Location.findOneAndUpdate(
      { businessCode },
      {
        businessCode,
        enabled,
        latitude,
        longitude,
        radius,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json({
      success: true,
      data: location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLocation = async (req, res) => {
  try {
    const { businessCode  } = req.params;

    const location = await Location.findOne({
      businessCode ,
    });

    res.status(200).json({
      success: true,
      data: location,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyLocation = async (req, res) => {
  try {
    const {
      businessCode ,
      customerLatitude,
      customerLongitude,
    } = req.body;

    const location = await Location.findOne({
      businessCode,
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location settings not found",
      });
    }

    if (!location.enabled) {
      return res.status(200).json({
        success: true,
        allowed: true,
      });
    }

    const distance = getDistance(
      customerLatitude,
      customerLongitude,
      location.latitude,
      location.longitude
    );

    const allowed =
      distance <= location.radius;

    res.status(200).json({
      success: true,
      allowed,
      distance: Math.round(distance),
      radius: location.radius,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};