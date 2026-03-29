import { getFirebaseAdminDb } from "../firebase/admin";
import { seedCollections } from "../lib/seed-data";

async function seed() {
  const db = getFirebaseAdminDb();

  for (const [collectionName, documents] of Object.entries(seedCollections)) {
    for (const document of documents) {
      await db.collection(collectionName).doc(document.id).set(document);
    }
    console.log(`Seeded ${documents.length} documents into ${collectionName}`);
  }
}

seed()
  .then(() => {
    console.log("TownConnect seed complete.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("TownConnect seed failed:", error);
    process.exit(1);
  });
