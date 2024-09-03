const admin = require("firebase-admin");
const serviceAccount = require("./humorhub-73ff9-firebase-adminsdk-oyk79-c9b562fce5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const cities = require("./cities.json");

// Function to upload cities with the current timestamp
const uploadCities = async () => {
  const batch = db.batch();

  cities.forEach((city) => {
    // Set the current timestamp
    city.googleTimestamp = Date.now();

    // Create a reference to the document
    const docRef = db.collection("cities").doc(city.id.toString());

    // Add the city to the batch
    batch.set(docRef, city);
  });

  // Commit the batch
  await batch.commit();
  console.log("Cities uploaded successfully!");
};

// Run the upload function
uploadCities().catch((error) => {
  console.error("Error uploading cities:", error);
});
