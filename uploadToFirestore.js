const admin = require("firebase-admin");
const serviceAccount = require("./humorhub-73ff9-firebase-adminsdk-oyk79-c27f399854.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Load the updated JSON file
const updatedEvents = require("./formatted_events.json");

// Update or add events in Firestore
const updateEvents = async () => {
  const batch = db.batch();

  for (const updatedEvent of updatedEvents) {
    const docRef = db.collection("userEvents").doc(updatedEvent.id);
    const doc = await docRef.get();

    // Add a current timestamp to the event if it is being added
    const currentTimestamp = new Date().toISOString();

    if (doc.exists) {
      const existingEvent = doc.data();
      if (!areEventsEqual(existingEvent, updatedEvent)) {
        batch.update(docRef, {
          ...updatedEvent,
          googleTimestamp: currentTimestamp, // Update timestamp when updating
        });
        console.log(`Queued update for event with ID ${updatedEvent.id}.`);
      }
    } else {
      // If the event does not exist, add it with a timestamp
      batch.set(docRef, {
        ...updatedEvent,
        googleTimestamp: currentTimestamp, // Set timestamp when adding
      });
      console.log(`Queued addition for event with ID ${updatedEvent.id}.`);
    }
  }

  // Commit the batch
  await batch.commit();
  console.log("Batch write completed.");
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
    event1.lng === event2.lng
  );
}

// Run the update function
updateEvents().catch((error) => {
  console.error("Error updating events:", error);
});
