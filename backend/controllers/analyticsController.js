const Url   = require("../models/Url");
const Click = require("../models/Click");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Group an array of docs by a field and count occurrences.
 * Returns [{ label, count, percentage }] sorted descending.
 */
const aggregateField = (docs, field) => {
  const map = {};
  for (const doc of docs) {
    const key = doc[field] || "Unknown";
    map[key] = (map[key] || 0) + 1;
  }
  const total = docs.length || 1;
  return Object.entries(map)
    .map(([label, count]) => ({
      label,
      count,
      percentage: parseFloat(((count / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count);
};

// ─── Controller ──────────────────────────────────────────────────────────────

/**
 * GET /api/urls/:id/analytics
 * Protected — req.user set by auth middleware.
 */
const getAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verify URL exists and belongs to the requesting user
    const url = await Url.findById(id);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found.",
      });
    }

    if (url.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view these analytics.",
      });
    }

    // 2. Fetch all clicks for this URL (newest first)
    const allClicks = await Click.find({ urlId: id }).sort({ clickedAt: -1 }).lean();

    const totalClicks = allClicks.length;

    // 3. Last visited timestamp
    const lastVisited = totalClicks > 0 ? allClicks[0].clickedAt : null;

    // 4. Recent 10 visits
    const recentVisits = allClicks.slice(0, 10).map((click) => ({
      id:         click._id,
      browser:    click.browser    || "Unknown",
      os:         click.os         || "Unknown",
      deviceType: click.deviceType || "Unknown",
      country:    click.country    || "Unknown",
      city:       click.city       || "Unknown",
      referrer:   click.referrer   || "Direct",
      ip:         click.ip         || "Unknown",
      clickedAt:  click.clickedAt,
    }));

    // 5. Browser statistics
    const browserStats = aggregateField(allClicks, "browser");

    // 6. Device statistics
    const deviceStats = aggregateField(allClicks, "deviceType");

    // 7. OS statistics (bonus — useful in dashboard)
    const osStats = aggregateField(allClicks, "os");

    // 8. Daily click timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyMap = {};
    for (const click of allClicks) {
      if (click.clickedAt < thirtyDaysAgo) continue;
      const day = click.clickedAt.toISOString().slice(0, 10); // "YYYY-MM-DD"
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    }
    const clickTimeline = Object.entries(dailyMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 9. Build response
    return res.status(200).json({
      success: true,
      data: {
        url: {
          id:          url._id,
          originalUrl: url.originalUrl,
          shortCode:   url.shortCode,
          customAlias: url.customAlias || null,
          title:       url.title       || null,
          createdAt:   url.createdAt,
          expiresAt:   url.expiresAt   || null,
          isActive:    url.isActive,
        },
        totalClicks,
        lastVisited,
        recentVisits,
        browserStats,
        deviceStats,
        osStats,
        clickTimeline,
      },
    });
  } catch (err) {
    console.error("[getAnalytics]", err);

    // Handle malformed MongoDB ObjectId
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid URL ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while fetching analytics.",
    });
  }
};

module.exports = { getAnalytics };
// Analytics controller stubs
exports.recordVisit = async (req, res) => {
  res.status(201).json({ message: 'recordVisit (stub)' });
};

exports.getAnalytics = async (req, res) => {
  res.status(200).json({ message: 'getAnalytics (stub)' });
};
