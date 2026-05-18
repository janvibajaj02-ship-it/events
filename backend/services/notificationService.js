// Notification Service Layer - Business Logic

const Notification = require('../models/Notification');
const User = require('../models/User');
const { NotFoundError } = require('../utils/errors');

const notificationService = {
  // Create notification
  async createNotification(userId, message, type = 'system', priority = 'normal', relatedId = null) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const notification = await Notification.create({
      userId,
      message,
      type,
      priority,
      relatedId,
      read: false
    });

    return notification;
  },

  // Get user notifications
  async getUserNotifications(userId, filters = {}) {
    const query = { userId };

    if (filters.read !== undefined) {
      query.read = filters.read;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50);

    return notifications;
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    return notification;
  },

  // Mark all notifications as read
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    return { message: 'All notifications marked as read' };
  },

  // Get unread count
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({ userId, read: false });
    return { unreadCount: count };
  },

  // Delete notification
  async deleteNotification(notificationId) {
    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification');
    }

    return { message: 'Notification deleted successfully' };
  },

  // Clear all notifications for user
  async clearAll(userId) {
    await Notification.deleteMany({ userId });
    return { message: 'All notifications cleared' };
  }
};

module.exports = notificationService;
