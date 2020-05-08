import * as Yup from 'yup';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Courier from '../models/Courier';
import File from '../models/File';

import Mail from '../../lib/Mail';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll({
      where: {
        canceled_at: null,
      },
      order: ['start_date'],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: Courier,
          as: 'courier',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip_code',
          ],
        },
      ],
    });

    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().positive().integer().required(),
      courier_id: Yup.number().positive().integer().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipientExists = await Recipient.findByPk(req.body.recipient_id);

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient not found' });
    }

    const courier = await Courier.findByPk(req.body.courier_id);

    if (!courier) {
      return res.status(400).json({ error: 'Courier not found' });
    }

    const { id, product, recipient_id, courier_id } = await Order.create(
      req.body
    );

    // Envio de email para o courier
    await Mail.sendMail({
      to: `${courier.name} <${courier.email}>`,
      subject: 'Nova encomenda cadastrada',
      text: 'Vocẽ tem uma nova encomenda para entregar',
    });

    return res.json({ id, product, recipient_id, courier_id });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      courier_id: Yup.number().positive().integer().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { courier_id } = req.body;

    const courierExists = await Courier.findOne({ where: courier_id });

    if (!courierExists) {
      return res.status(400).json({ error: 'Courier not exists' });
    }

    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(400).json({ error: 'Order not exists' });
    }

    order.courier_id = courier_id;

    await order.save();

    return res.json(order);
  }

  async delete(req, res) {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);

    if (order.canceled_at) {
      return res.status(400).json({ error: 'Order already cancelled' });
    }

    order.canceled_at = new Date();

    await order.save();

    return res.json(order);
  }
}

export default new OrderController();
