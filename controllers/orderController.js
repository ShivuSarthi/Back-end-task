const Order = require("../models/orderModel");
const ErrorHander = require("../utils/errorhander");
const cron = require("node-cron");
const sendEmail = require("../utils/sendEmail");

// Create new Order
exports.newOrder = async (req, res, next) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      shippingPrice,
      totalPrice,
      user_id
    } = req.body;

    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: user_id
    });

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error creating new order:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create new order" });
  }
};

// get Single Order
exports.getSingleOrder = async (req, res, next) => {
  try {
    // Find the order by ID and populate the 'user' field with 'name' and 'email'
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return next(new ErrorHander("Order not found with this ID", 404));
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error fetching single order:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch order details" });
  }
};

// get logged in user  Orders
exports.myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.query.id });
    if (!orders) {
      return next(new ErrorHander("Order not found with this ID", 404));
    }

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch user orders" });
  }
};

// get all Orders -- Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    // Get total count of orders
    const ordersCount = await Order.countDocuments();

    const orders = await Order.find();

    // Calculate total amount by summing up all order totalPrice values
    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      Total_count: ordersCount,
      totalAmount: totalAmount,
      orders: orders
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch all orders" });
  }
};

// Function to send email with orders received today
const sendOrderEmail = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: today }
    }).populate("user", "name email"); // Populate user details in orders

    // Prepare email content with a table layout
    const message = `
  <h1>Orders Received Today</h1>
  <table style="border-collapse: collapse; width: 100%;">
    <thead>
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px;">Order ID</th>
        <th style="border: 1px solid #ddd; padding: 8px;">User Email</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Order Items</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Total Amount</th>
      </tr>
    </thead>
    <tbody>
      ${orders
        .map(
          (order) => `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${order._id}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${
            order.user.email
          }</td>
          <td style="border: 1px solid #ddd; padding: 8px;">
            <ul>
              ${order.orderItems
                .map(
                  (item) => `
                <li>${item.name} (Qty: ${
                    item.quantity
                  }) - $${item.price.toFixed(2)}</li>
              `
                )
                .join("")}
            </ul>
          </td>
          <td style="border: 1px solid #ddd; padding: 8px;">$${order.totalPrice.toFixed(
            2
          )}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
`;

    await sendEmail({
      email: "shivakumarsarthi@gmail.com",
      subject: `Orders Received Today`,
      message
    });

    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Schedule cron job to run at 10:00 PM every day
cron.schedule("0 22 * * *", () => {
  console.log("Running cron job...");
  sendOrderEmail();
});
