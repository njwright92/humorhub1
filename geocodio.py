import json
import requests

# Load the events from the JSON file
with open('updated_events.json') as f:
    events = json.load(f)

# Set up your Geocodio API key
api_key = '0fe66ebfe6fbe6b2fe60664fbe362223b60b33f'

# Function to compare coordinates


def coordinates_match(event, lat, lng):
    return float(event.get('lat', 0)) == lat and float(event.get('lng', 0)) == lng


# Iterate through the events and update the coordinates
for event in events:
    address = event.get('location')

    if not address:
        print(f"No address found for event: {event}")
        continue

    # Only process if coordinates are missing or don't match
    if 'lat' in event and 'lng' in event:
        print(f"Coordinates already exist for event at {address}")
    else:
        print(f"Processing event for address: {address}")

    # Create a Geocodio API request
    url = f'https://api.geocod.io/v1.6/geocode?q={address}&api_key={api_key}'
    response = requests.get(url)

    # Check if the response was successful
    if response.status_code == 200:
        data = response.json()
        if 'results' in data and len(data['results']) > 0:
            lat = data['results'][0]['location']['lat']
            lng = data['results'][0]['location']['lng']

            # Only update if coordinates do not match
            if not coordinates_match(event, lat, lng):
                print(
                    f"Updating coordinates for event at {address}: New lat {lat}, New lng {lng}")
                event['lat'] = lat
                event['lng'] = lng
            else:
                print(f"Coordinates for {address} are already correct.")
        else:
            print(f"No results found for address: {address}")
    else:
        print(f"Error geocoding {address}: {response.status_code}")

# Save the updated events to a new JSON file
with open('updated_events.json', 'w') as f:
    json.dump(events, f, indent=4)

print("Event coordinates update complete.")
