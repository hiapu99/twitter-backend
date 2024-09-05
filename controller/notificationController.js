const Notification = require('../models/notification.model.js');

// Get Notifications
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch notifications for the user and populate the 'from' field
        const notifications = await Notification.find({ to: userId }).populate({
            path: "from",
            select: "username profileImg",
        });

        // Mark all notifications as read
        await Notification.updateMany({ to: userId }, { read: true });

        res.status(200).json(notifications);
    } catch (error) {
        console.log("Error in getNotifications function:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Delete Notifications
exports.deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        // Delete all notifications for the user
        await Notification.deleteMany({ to: userId });

        res.status(200).json({ message: "Notifications deleted successfully" });
    } catch (error) {
        console.log("Error in deleteNotifications function:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
