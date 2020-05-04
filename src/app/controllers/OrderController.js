import * as Yup from 'yup';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Courier from '../models/Courier';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll();

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

    const courierExists = await Courier.findByPk(req.body.courier_id);

    if (!courierExists) {
      return res.status(400).json({ error: 'Courier not found' });
    }

    const { id, product, recipient_id, courier_id } = await Order.create(
      req.body
    );

    return res.json({ id, product, recipient_id, courier_id });
  }

  async update(req, res) {
    return res.json();
  }

  async delete(req, res) {
    return res.json();
  }
}

export default new OrderController();
