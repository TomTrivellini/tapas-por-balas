import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "./firebase";

const itemsCollection = collection(db, "items");
const ordersCollection = collection(db, "orders");

const mapDoc = (snapshot) => ({ ...snapshot.data(), id: snapshot.id });

export async function getShopList(categoryId) {
  const queryRef = categoryId
    ? query(itemsCollection, where("category", "==", categoryId))
    : itemsCollection;
  const snapshot = await getDocs(queryRef);
  return snapshot.docs.map(mapDoc);
}

export async function createOrder(order) {
  const snapshot = await addDoc(ordersCollection, {
    ...order,
    createdAt: serverTimestamp(),
  });
  return snapshot.id;
}
