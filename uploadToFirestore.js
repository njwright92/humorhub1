const admin = require("firebase-admin");
const serviceAccount = require("./humorhub-73ff9-firebase-adminsdk-oyk79-c27f399854.json"); // Updated Firebase Admin SDK path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Load the updated JSON file
const updatedEvents = require("./updated_events.json");

// Update or add only the events that do not exist in Firestore
updatedEvents.forEach((updatedEvent) => {
  const docRef = db.collection("userEvents").doc(updatedEvent.id);
  docRef.get().then((doc) => {
    if (doc.exists) {
      const existingEvent = doc.data();
      if (!areEventsEqual(existingEvent, updatedEvent)) {
        docRef
          .update(updatedEvent)
          .then(() => {
            console.log(
              `Event with ID ${updatedEvent.id} updated successfully.`
            );
          })
          .catch((error) => {
            console.error(
              `Error updating event with ID ${updatedEvent.id}:`,
              error
            );
          });
      }
    } else {
      // If the event does not exist, add it
      docRef
        .set(updatedEvent)
        .then(() => {
          console.log(`Event with ID ${updatedEvent.id} added successfully.`);
        })
        .catch((error) => {
          console.error(
            `Error adding event with ID ${updatedEvent.id}:`,
            error
          );
        });
    }
  });
});

// Helper function to compare two events
function areEventsEqual(event1, event2) {
  return (
    event1.name === event2.name &&
    event1.location === event2.location &&
    event1.date === event2.date &&
    event1.details === event2.details &&
    event1.lat === event2.lat &&
    event1.lng === event2.lng
  );
}
