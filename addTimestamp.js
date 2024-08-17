const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("./humorhub-73ff9-firebase-adminsdk-oyk79-c27f399854.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const eventsFilePath = path.join(__dirname, "updated_events.json");

// Function to update the timestamp property for each event
const addTimestampsToEvents = async () => {
  const eventsRef = db.collection("userEvents");
  const snapshot = await eventsRef.get();

  if (snapshot.empty) {
    console.log("No events found.");
    return;
  }

  const batch = db.batch();
  const updatedEvents = [];

  snapshot.forEach((doc) => {
    const event = doc.data();
    const eventId = doc.id;

    // Add or update the googleTimestamp property
    if (!event.googleTimestamp) {
      const googleTimestamp = new Date().toISOString(); // Get the current timestamp in ISO format
      event.googleTimestamp = googleTimestamp;
      batch.update(doc.ref, { googleTimestamp });
      console.log(`Queued timestamp addition for event with ID ${eventId}.`);
    }

    // Push the updated event to the array
    updatedEvents.push({ id: eventId, ...event });
  });

  // Commit the batch
  await batch.commit();
  console.log("Batch write for timestamps completed.");

  // Write the updated events to updated_events.json
  fs.writeFileSync(eventsFilePath, JSON.stringify(updatedEvents, null, 2));
  console.log("Updated events written to updated_events.json.");
};

// Run the timestamp addition function
addTimestampsToEvents().catch((error) => {
  console.error("Error adding timestamps to events:", error);
});
