from firebase_admin import credentials, firestore, storage
import firebase_admin
import os
import re
import json
import uuid
import requests
from datetime import datetime
from dotenv import load_dotenv
from google.cloud import vision
from google.cloud.vision_v1 import types

# Load environment variables from .env file
load_dotenv()

# Default coordinates (e.g., city center)
DEFAULT_LATITUDE = 29.9511   # Example: New Orleans latitude
DEFAULT_LONGITUDE = -90.0715  # Example: New Orleans longitude

# Load environment variables
service_account_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
geocodio_api_key = os.getenv('GEOCODIO_API_KEY')

if not service_account_path or not geocodio_api_key:
    raise Exception(
        "Environment variables 'GOOGLE_APPLICATION_CREDENTIALS' and 'GEOCODIO_API_KEY' must be set.")

# Initialize Firebase
cred = credentials.Certificate(service_account_path)
firebase_admin.initialize_app(cred, {
    # Updated with your Firebase Storage bucket URL
    'storageBucket': 'humorhub-73ff9.appspot.com',
})

db = firestore.client()
bucket = storage.bucket()

# Initialize Google Vision Client
vision_client = vision.ImageAnnotatorClient()


def get_unprocessed_blobs():
    """Retrieve a list of unprocessed image blobs from the 'events' folder in Firebase Storage."""
    print("Fetching blobs from 'events/' folder in Firebase Storage...")
    # Only list blobs in the 'events/' folder
    blobs = bucket.list_blobs(prefix='events/')
    blobs = list(blobs)  # Convert iterator to list for reuse
    print(f"Total blobs found in 'events/' folder: {len(blobs)}")

    # Exclude folder blobs
    blobs = [blob for blob in blobs if not blob.name.endswith('/')]

    processed_images_ref = db.collection('processed_images')
    processed_images_docs = processed_images_ref.stream()
    processed_images = set(doc.to_dict()['file_name']
                           for doc in processed_images_docs)
    print(f"Number of processed images recorded: {len(processed_images)}")

    unprocessed_blobs = [
        blob for blob in blobs if blob.name not in processed_images]
    print(f"Number of unprocessed blobs to process: {len(unprocessed_blobs)}")
    return unprocessed_blobs


def extract_text_with_google_vision(blob):
    """Use Google Vision API to extract text from the image."""
    print(f"Downloading and extracting text from image: {blob.name}")
    # Download the image content
    content = blob.download_as_bytes()
    print("Image downloaded.")

    # Prepare the image for Google Vision API
    image = types.Image(content=content)

    # Perform text detection
    response = vision_client.text_detection(image=image)
    texts = response.text_annotations

    if response.error.message:
        raise Exception(
            f"Google Vision API error for image {blob.name}: {response.error.message}")

    if texts:
        extracted_text = texts[0].description  # Get the full detected text
    else:
        extracted_text = ""

    print("Text extraction complete.")
    print(f"Extracted Text:\n{extracted_text}")
    return extracted_text


def parse_event_details(text):
    """Parse the extracted text to obtain event details."""
    print("Parsing event details from extracted text...")
    event_details = {}

    # Split the text into lines
    lines = text.strip().split('\n')
    print(f"Lines: {lines}")

    # Initialize variables
    event_name = None
    location = None
    details = []
    date = 'Unknown'
    time_str = 'Unknown Time'

    # Patterns to identify event name
    event_name_patterns = [
        r'^(Open Mic at .+)$',
        r'^(.*Open Mic.*)$',
        r'^(.*Comedy Show.*)$',
        r'^(.*Stand[-\s]?Up.*)$',
        r'^(.*Comedy Night.*)$',
        r'^(.*Laughs.*)$',
        r'^(.*Giggles.*)$',
        r'^(.*Comedy Competition.*)$',
    ]

    # Search for event name
    for line in lines:
        for pattern in event_name_patterns:
            match = re.match(pattern, line.strip(), re.IGNORECASE)
            if match:
                event_name = match.group(1).strip()
                break
        if event_name:
            break

    # Fallback if event name not found
    if not event_name:
        event_name = 'Unknown Event Name'

    # Extract date (day of the week)
    weekdays_patterns = {
        'Monday': r'\bMon(?:day)?\b',
        'Tuesday': r'\bTue(?:sday)?\b',
        'Wednesday': r'\bWed(?:nesday)?\b',
        'Thursday': r'\bThu(?:rsday)?\b',
        'Friday': r'\bFri(?:day)?\b',
        'Saturday': r'\bSat(?:urday)?\b',
        'Sunday': r'\bSun(?:day)?\b',
    }
    for day, pattern in weekdays_patterns.items():
        for line in lines:
            if re.search(pattern, line, re.IGNORECASE):
                date = day
                break

    # Extract time
    time_pattern = r"\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\b"
    for line in lines:
        time_match = re.search(time_pattern, line, re.IGNORECASE)
        if time_match:
            time_str = time_match.group(1)
            break

    # Extract location
    location_patterns = [
        r"^(?:Location|Venue|At|Where)[:\-]?\s*(.+)$",
        r"^.*\d{1,5}\s+\w+\s+\w+.*$",  # Addresses like '2075 Mission St'
        r".*(Pub|Bar|Club|Cafe|Restaurant|Theatre|Hall|Lounge|Center|Centre).*",
    ]
    for line in lines:
        for pattern in location_patterns:
            match = re.match(pattern, line.strip(), re.IGNORECASE)
            if match:
                if match.lastindex:
                    location = match.group(1).strip()
                else:
                    location = line.strip()
                break
        if location:
            break

    # Fallback location
    if not location:
        location = 'Unknown Location'

    # Extract additional details
    for line in lines:
        line_clean = line.strip()
        if line_clean and line_clean not in [event_name, location]:
            details.append(line_clean)

    details_text = ' '.join(details)

    # Generate unique ID and timestamp
    event_details['id'] = generate_event_id()
    event_details['name'] = event_name
    event_details['date'] = date
    event_details['isRecurring'] = True  # Or determine based on text
    event_details['location'] = location
    event_details['details'] = f"{details_text} Time: {time_str}."
    event_details['googleTimestamp'] = datetime.utcnow().isoformat() + 'Z'

    print(f"Parsed event details: {event_details}")
    return event_details

def get_coordinates(address):
    """Geocode the event location using Geocod.io API or use default coordinates."""
    if not address:
        print("No address provided, using default coordinates.")
        return {'lat': DEFAULT_LATITUDE, 'lng': DEFAULT_LONGITUDE}
    print(f"Geocoding address: {address}")
    api_key = geocodio_api_key
    url = f'https://api.geocod.io/v1.6/geocode'
    params = {
        'q': address,
        'api_key': api_key,
    }
    response = requests.get(url, params=params)
    data = response.json()

    if 'results' in data and len(data['results']) > 0:
        location = data['results'][0]['location']
        print(f"Geocoding successful: {location}")
        return {
            'lat': location['lat'],
            'lng': location['lng'],
        }
    else:
        print('Geocoding failed for address:', address)
        print("Using default coordinates.")
        return {'lat': DEFAULT_LATITUDE, 'lng': DEFAULT_LONGITUDE}


def construct_event_object(event_details, coordinates):
    """Construct the event object in the required format."""
    print("Constructing event object...")
    event = {
        'id': event_details.get('id') or generate_event_id(),
        'date': event_details['date'],
        'name': event_details['name'],
        'isRecurring': event_details['isRecurring'],
        'location': event_details['location'],
        'lat': coordinates['lat'],
        'lng': coordinates['lng'],
        'details': event_details['details'],
        'googleTimestamp': event_details.get('googleTimestamp') or datetime.utcnow().isoformat() + 'Z',
    }
    print(f"Constructed event object: {event}")
    return event


def generate_event_id():
    """Generate a unique ID for the event if not provided."""
    return str(uuid.uuid4())


def is_event_valid(event):
    """Validate the event format before adding to Firestore."""
    print("Validating event object...")
    required_fields = ['id', 'name', 'lat', 'lng']
    for field in required_fields:
        if field not in event or event[field] is None or event[field] == '':
            print(f"Event is missing required field: {field}")
            return False
    print("Event is valid.")
    return True


def mark_image_as_processed(file_name):
    """Record the image as processed in Firestore."""
    print(f"Marking image as processed: {file_name}")
    processed_images_ref = db.collection('processed_images')
    processed_images_ref.add({
        'file_name': file_name,
        'processed_at': firestore.SERVER_TIMESTAMP,
    })


def clean_up_files(file_paths):
    """Delete temporary files created during processing."""
    print("Cleaning up temporary files...")
    for file_path in file_paths:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted temporary file: {file_path}")


def log_error(file_name, error_message):
    """Log any errors that occur during processing."""
    print(f"Logging error for image {file_name}: {error_message}")
    error_logs_ref = db.collection('processing_errors')
    error_logs_ref.add({
        'file_name': file_name,
        'error_message': error_message,
        'timestamp': firestore.SERVER_TIMESTAMP,
    })


def are_events_equal(event1, event2):
    """Compare two events to determine if they are equal."""
    fields_to_compare = ['isRecurring', 'name', 'location',
                         'date', 'details', 'lat', 'lng', 'googleTimestamp']
    for field in fields_to_compare:
        if event1.get(field) != event2.get(field):
            return False
    return True


def sync_events(new_events):
    """Synchronize events with Firestore, updating or deleting as necessary."""
    print("Starting event synchronization...")

    # Create a set of new event IDs
    new_event_ids = set(event['id'] for event in new_events)
    print(f"New event IDs: {new_event_ids}")

    # Fetch all existing events from Firestore
    existing_events_snapshot = db.collection('userEvents').get()
    existing_events_map = {doc.id: doc.to_dict()
                           for doc in existing_events_snapshot}
    print(f"Existing event IDs: {set(existing_events_map.keys())}")

    # Identify events to delete
    events_to_delete = [
        doc_id for doc_id in existing_events_map if doc_id not in new_event_ids]
    print(f"Events to delete: {events_to_delete}")

    # Identify events to add or update
    events_to_add_or_update = []
    for event in new_events:
        event_id = event['id']
        existing_event = existing_events_map.get(event_id)

        if existing_event:
            if not are_events_equal(existing_event, event):
                events_to_add_or_update.append(
                    {'type': 'update', 'event': event})
                print(f"Event {event_id} marked for update.")
            else:
                print(f"Event {event_id} is unchanged.")
        else:
            # Check if an event with the same name, date, and location exists
            duplicate_found = False
            for existing_event_id, existing_event in existing_events_map.items():
                existing_event_date = existing_event.get('date', '')
                existing_event_location = existing_event.get('location', '')
                if (
                    existing_event_date == event['date'] and
                    existing_event_location == event['location']
                ):
                    print(
                        f"Duplicate event found: {event['name']} at {event['location']} on {event['date']}. Skipping addition.")
                    duplicate_found = True
                    break

            if not duplicate_found:
                events_to_add_or_update.append({'type': 'add', 'event': event})
                print(f"Event {event_id} marked for addition.")

    # Process deletions
    if events_to_delete:
        print(f"Deleting {len(events_to_delete)} events...")
        batch = db.batch()
        for event_id in events_to_delete:
            doc_ref = db.collection('userEvents').document(event_id)
            batch.delete(doc_ref)
            print(f"Scheduled deletion of event {event_id}")
        batch.commit()
        print(f"Deleted {len(events_to_delete)} events.")
    else:
        print("No events to delete.")

    # Process additions and updates
    if events_to_add_or_update:
        print(
            f"Processing {len(events_to_add_or_update)} additions/updates...")
        batch = db.batch()
        for item in events_to_add_or_update:
            event = item['event']
            doc_ref = db.collection('userEvents').document(event['id'])
            if item['type'] == 'add':
                batch.set(doc_ref, event)
                print(f"Scheduled addition of event {event['id']}")
            elif item['type'] == 'update':
                batch.update(doc_ref, event)
                print(f"Scheduled update of event {event['id']}")
        batch.commit()
        print(f"Added/Updated {len(events_to_add_or_update)} events.")
    else:
        print("No events to add or update.")


def is_duplicate_event(event, new_events):
    """Check if the event is a duplicate within the new events list."""
    for existing_event in new_events:
        if (existing_event['date'] == event['date'] and
                existing_event['location'] == event['location']):
            return True
    return False


def process_images():
    """Main function to process images and synchronize events."""
    print("Starting image processing...")
    unprocessed_blobs = get_unprocessed_blobs()
    new_events = []

    for blob in unprocessed_blobs:
        try:
            print(f'Processing image: {blob.name}')

            # Extract text using Google Vision API
            extracted_text = extract_text_with_google_vision(blob)

            # Parse event details
            event_details = parse_event_details(extracted_text)

            # Geocode the event location
            coordinates = get_coordinates(event_details['location'])

            if not coordinates:
                raise Exception('Could not obtain coordinates.')

            # Construct the event object
            event = construct_event_object(event_details, coordinates)

            # Validate the event
            if not is_event_valid(event):
                print(f"Event from image {blob.name} is invalid. Skipping...")
                continue  # Skip this event

            # Add event to the list of new events
            new_events.append(event)

            # Mark the image as processed
            mark_image_as_processed(blob.name)

        except Exception as e:
            print(f'Error processing image {blob.name}: {e}')
            log_error(blob.name, str(e))
            continue

    # After processing all images, save new events to a file for review
    if new_events:
        with open('new_events.json', 'w') as f:
            json.dump(new_events, f, indent=4)
        print("New events have been saved to 'new_events.json' for review.")

        # Wait for user input before syncing
        input("Press Enter to continue with syncing events to Firestore...")

        # Proceed to sync events
        sync_events(new_events)
    else:
        print("No new events to process.")


def clear_processed_images():
    """Delete all documents in the 'processed_images' collection."""
    print("Clearing 'processed_images' collection...")
    processed_images_ref = db.collection('processed_images')
    docs = processed_images_ref.stream()
    for doc in docs:
        doc.reference.delete()
    print("'processed_images' collection has been cleared.")


if __name__ == '__main__':
    clear_processed_images()
    process_images()
