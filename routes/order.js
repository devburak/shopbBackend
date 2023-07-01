const express = require('express');
const Order = require('../db/models/order')
const { generateOrderCode } = require('../utils/code');
const { jwtAuthMiddleware, isAdmin, isAdminOrStaff } = require('../middleware/jwtAuth');
const { Types } = require('mongoose');
const router = express.Router();


router.get('/ordercode', (req, res) => {
    try {
        const orderCode = generateOrderCode();
        res.status(200).json({ orderCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});

// by Order Code
router.get('/byordercode/:orderCode', jwtAuthMiddleware, async (req, res) => {
    try {
        const { orderCode } = req.params;
        const { userId = null, role, email } = req.user;
        const { guestMail } = req.query;


        let query = { orderCode };

        // Eğer kullanıcı bir customer ise sadece kendi siparişlerini görebilir
        if (role === 'customer') {
            query.customer = req.user._id;
        }

        // Eğer misafir bir kullanıcı ise ordercode ve email karşılaştırması yapılır
        if (!userId && guestMail && orderCode) {
            query = {
                ...query,
                'guestCustomer.email': guestMail
            };
        }

        const order = await Order.findOne(query);

        if (!order) {
            return res.status(404).json({ error: 'Sipariş bulunamadı' });
        }

        res.status(200).json(order);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});

//new Order
router.post('/create', jwtAuthMiddleware, async (req, res) => {
    try {
        // Kullanıcı bilgilerini al
        const { userId, role } = req.user;
        const { guestMail } = req.query;

        // Sipariş verilerini oluştur
        const orderData = {
            customer: userId,
            guestCustomer: {
                name: req.body.name,
                address: req.body.address,
                email: guestMail || req.body.email,
                phoneNumber: req.body.phoneNumber || null
            },
            products: req.body.products.map(product => ({
                productId: product.productId,
                quantity: product.quantity || 1
            })),
            address: req.body.address,
            status: req.body.status || 'preparing',
            orderDate: req.body.orderDate || Date.now(),
            shipmentDate: req.body.shipmentDate || null,
            paymentDate: req.body.paymentDate || null,
            note: req.body.note || null,
            latestProccess: null,
            amount: req.body.amount,
            paymentMethod: req.body.paymentMethod,
            paymentStatus: req.body.paymentStatus || 'pending',
            orderCode: req.body.orderCode
        };

        // Siparişi oluştur
        const order = await Order.create(orderData);

        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});
//payment update
router.post('/payment', jwtAuthMiddleware, async (req, res) => {
    try {
        const { paymentMethod, paymentId, orderId } = req.body;
        const { userId, role } = req.user;
        const { guestMail } = req.query;

        // Sadece kullanıcı ve misafir rollerine sahip olanlar ödeme yapabilir
        if (role !== 'customer' && role !== 'guest') {
            return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
        }


        const updateFields = {
            paymentStatus: 'paid',
            paymentMethod: paymentMethod,
            paymentDate: new Date(),
            status: 'preparing',
            paymentId: paymentId
        };

        // Kullanıcıya göre siparişin güncellenmesi
        const updatedOrder = await Order.findOneAndUpdate(
            {
                _id: orderId,
                $or: [
                    { customer: userId },
                    { 'guestCustomer.email': guestMail }
                ]
            },
            updateFields,
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Sipariş bulunamadı veya güncellenemedi' });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});


// PUT /orders/:orderId
// Admin veya staff kullanıcıları tarafından sipariş güncelleme
router.put('/:orderId', jwtAuthMiddleware, isAdminOrStaff, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, shipmentDate, orderCode, paymentMethod, paymentId } = req.body;
        const latestProccess = req.user.userId;
        const updateFields = {};

        if (status) updateFields.status = status;
        if (shipmentDate) updateFields.shipmentDate = shipmentDate;
        if (orderCode) updateFields.orderCode = orderCode;
        if (latestProccess) updateFields.latestProccess = latestProccess;
        if (paymentMethod) updateFields.paymentMethod = paymentMethod;
        if (paymentId) updateFields.paymentId = paymentId;


        const updatedOrder = await Order.findOneAndUpdate(
            { _id: orderId },
            updateFields,
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Sipariş bulunamadı' });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});


//report Orders

router.get('/report/:productId', jwtAuthMiddleware, isAdminOrStaff, async (req, res) => {
    try {
      const { productId } = req.params;
      const { startDate, endDate } = req.query;
  
      const query = {
        'products.productId': productId,
        paymentStatus: 'paid',
        orderDate: {}
      };
  
      if (startDate && endDate) {
        query.orderDate.$gte = new Date(startDate);
        query.orderDate.$lte = new Date(endDate);
      } else {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query.orderDate.$gte = thirtyDaysAgo;
        query.orderDate.$lte = new Date();
      }
  
      const orders = await Order.find(query);
  
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((total, order) => total + order.amount, 0);
  
      res.status(200).json({ totalOrders, totalRevenue });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An Error' });
    }
  });
  



module.exports = router;