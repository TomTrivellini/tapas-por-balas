import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const productsCollection = collection(db, "products");
const ordersCollection = collection(db, "orders");

const mapDoc = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });

export async function getShopList(categoryId) {
  const queryRef = categoryId
    ? query(productsCollection, where("category", "==", categoryId))
    : productsCollection;
  const snapshot = await getDocs(queryRef);
  return snapshot.docs.map(mapDoc);
}

export async function getShopById(id) {
  const snapshot = await getDoc(doc(productsCollection, id));
  if (!snapshot.exists()) return null;
  return mapDoc(snapshot);
}

export async function createOrder(order) {
  const snapshot = await addDoc(ordersCollection, {
    ...order,
    createdAt: serverTimestamp(),
  });
  return snapshot.id;
}

export async function seedProducts(products = []) {
  if (!Array.isArray(products) || products.length === 0) return 0;
  const batch = writeBatch(db);
  products.forEach((product) => {
    if (!product?.id) return;
    batch.set(doc(productsCollection, product.id), product);
  });
  await batch.commit();
  return products.length;
}
