import { getAllShopEntries } from "./gameData";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function getShopList(categoryId) {
  await delay(500);
  const all = getAllShopEntries();
  if (!categoryId) return all;
  return all.filter((x) => x.category === categoryId);
}

export async function getShopById(id) {
  await delay(500);
  const all = getAllShopEntries();
  return all.find((x) => x.id === id) || null;
}
