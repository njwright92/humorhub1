const fs = require("fs");
const path = require("path");

// Paths to input and output files
const inputFilePath = path.join(__dirname, "updated_events.json");
const outputFilePath = path.join(__dirname, "formatted_events.json");

// Load the current JSON file
const loadEvents = () => {
  try {
    const data = fs.readFileSync(inputFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading the input file:", error);
    process.exit(1);
  }
};

// Reformat events to match the desired format
const reformatEvents = (data) => {
  const reformattedEvents = [];

  if (Array.isArray(data)) {
    data.forEach((item) => {
      if (item.events && Array.isArray(item.events)) {
        item.events.forEach((event) => {
          // Check if all required properties are present
          if (
            event.date &&
            event.lng &&
            event.name &&
            event.location &&
            event.details &&
            event.isRecurring !== undefined &&
            event.lat
          ) {
            reformattedEvents.push({
              id: event.id || item.id, // Use event ID or parent ID
              date: event.date,
              lng: event.lng,
              name: event.name,
              location: event.location,
              details: event.details,
              isRecurring: event.isRecurring,
              lat: event.lat,
              googleTimestamp: item.googleTimestamp, // Use parent timestamp
            });
          } else {
            console.warn("Skipped an event due to missing properties:", event);
          }
        });
      } else {
        console.warn("No events array found or events is not an array:", item);
      }
    });
  } else {
    console.error("Data is not an array:", data);
  }

  return reformattedEvents;
};

// Write reformatted events to a new JSON file
const saveFormattedEvents = (events) => {
  try {
    fs.writeFileSync(outputFilePath, JSON.stringify(events, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing the output file:", error);
    process.exit(1);
  }
};

// Main function to run the reformatting
const main = () => {
  const data = loadEvents();
  const reformattedEvents = reformatEvents(data);
  saveFormattedEvents(reformattedEvents);
};

// Run the script
main();
