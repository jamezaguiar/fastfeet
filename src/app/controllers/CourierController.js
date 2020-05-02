import * as Yup from 'yup';
import Courier from '../models/Courier';

class CourierController {
  async index(req, res) {
    const couriers = await Courier.findAll();

    return res.json(couriers);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const courierExists = await Courier.findOne({
      where: { email: req.body.email },
    });

    if (courierExists) {
      return res.status(400).json({ error: 'Courier already exists.' });
    }

    const { id, name, email, avatar_id } = await Courier.create(req.body);

    return res.json({ id, name, email, avatar_id });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email(),
      avatar_id: Yup.number().positive().integer(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { courierId } = req.params;

    if (!courierId) {
      return res.status(400).json({ error: 'Courier ID not informed' });
    }

    const { email } = req.body;

    const courier = await Courier.findByPk(courierId);

    if (!courier) {
      return res.status(400).json({ error: 'Courier does not exists' });
    }

    if (email && email !== courier.email) {
      const courierExists = await Courier.findOne({
        where: { email },
      });

      if (courierExists) {
        return res.status(400).json({ error: 'Courier already exists.' });
      }
    }

    const { id, name, avatar_id } = await courier.update(req.body);

    return res.json({ id, name, email, avatar_id });
  }

  async delete(req, res) {
    const { courierId } = req.params;

    if (!courierId) {
      return res.status(400).json({ error: 'Courier ID not informed' });
    }

    const courier = await Courier.findByPk(courierId);

    if (!courier) {
      return res.status(400).json({ error: 'Courier does not exists' });
    }

    await courier.destroy();

    return res.json();
  }
}

export default new CourierController();
