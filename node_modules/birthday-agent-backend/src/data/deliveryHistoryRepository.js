import { DeliveryHistory } from "../db/deliveryHistory.model.js";

export async function createDeliveryHistory(entry) {
  const saved = await DeliveryHistory.create(entry);
  return saved.toJSON();
}

export async function listDeliveryHistory(limit = 100) {
  const items = await DeliveryHistory.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean(false);

  return items.map((item) => item.toJSON());
}
