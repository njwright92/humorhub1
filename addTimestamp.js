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
    }

    // Push the updated event to the array
    updatedEvents.push({ id: eventId, ...event });
  });

  // Commit the batch
  await batch.commit();

  // Write the updated events to updated_events.json
  fs.writeFileSync(eventsFilePath, JSON.stringify(updatedEvents, null, 2));
};

// Run the timestamp addition function
addTimestampsToEvents().catch((error) => {
  console.error("Error adding timestamps to events:", error);
});
