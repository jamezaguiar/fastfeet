import Order from '../models/Order';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll();

    return res.json(orders);
  }

  async store(req, res) {
    return res.json();
  }

  async update(req, res) {
    return res.json();
  }

  async delete(req, res) {
    return res.json();
  }
}

export default new OrderController();
