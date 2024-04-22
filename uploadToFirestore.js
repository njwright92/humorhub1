const admin = require("firebase-admin");
const serviceAccount = require("./humorhub-73ff9-firebase-adminsdk-oyk79-c27f399854.json"); // Updated Firebase Admin SDK path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Load the JSON file
const events = require("./converted_events.json");

// Upload each event to the 'userEvents' collection in Firestore
events.forEach((event) => {
  const docRef = db.collection("userEvents").doc(event.id); // Updated collection name
  docRef
    .set(event)
    .then(() => {
      console.log(`Event with ID ${event.id} added to Firestore`);
    })
    .catch((error) => {
      console.error(`Error adding event with ID ${event.id}:`, error);
    });
});
