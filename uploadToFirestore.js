const admin = require("firebase-admin");
const serviceAccount = require("./humorhub-73ff9-firebase-adminsdk-oyk79-c9b562fce5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Load the updated JSON file
const updatedEvents = require("./updated_events.json");

// Update, add, or delete events in Firestore
const syncEvents = async () => {
  const batch = db.batch();

  // Create a set of updated event IDs
  const updatedEventIds = new Set(updatedEvents.map((event) => event.id));

  // Fetch all existing events from Firestore
  const existingEventsSnapshot = await db.collection("userEvents").get();

  // Iterate over existing events in Firestore
  existingEventsSnapshot.forEach((doc) => {
    const existingEvent = doc.data();
    if (!updatedEventIds.has(doc.id)) {
      // If the event is not in the updated list, delete it
      console.log(
        `Deleting event with ID: ${doc.id} (Name: ${existingEvent.name})`
      );
      batch.delete(doc.ref);
    }
  });

  // Iterate over updated events and either add or update
  for (const updatedEvent of updatedEvents) {
    const docRef = db.collection("userEvents").doc(updatedEvent.id);
    const doc = await docRef.get();

    if (doc.exists) {
      const existingEvent = doc.data();
      if (!areEventsEqual(existingEvent, updatedEvent)) {
        batch.update(docRef, updatedEvent);
      } else {
      }
    } else {
      // If the event does not exist, add it

      batch.set(docRef, updatedEvent);
    }
  }
console.log("Events uploaded successfully!");
  // Commit the batch
  await batch.commit();
};

// Helper function to compare two events
function areEventsEqual(event1, event2) {
  return (
    event1.isRecurring === event2.isRecurring &&
    event1.name === event2.name &&
    event1.location === event2.location &&
    event1.date === event2.date &&
    event1.details === event2.details &&
    event1.lat === event2.lat &&
    event1.lng === event2.lng &&
    event1.googleTimestamp === event2.googleTimestamp
  );
}

// Run the update function
syncEvents().catch((error) => {
  console.error("Error syncing events:", error);
});
