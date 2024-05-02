import json
import requests

# Load the events from the JSON file
with open('converted_events.json') as f:
    events = json.load(f)

# Set up your Geocodio API key
api_key = '0fe66ebfe6fbe6b2fe60664fbe362223b60b33f'

# Iterate through the events and update the coordinates
for event in events:
    # Extract the address from the event
    address = event['location']

    # Create a Geocodio API request
    url = f'https://api.geocod.io/v1.6/geocode?q={address}&api_key={api_key}'
    response = requests.get(url)

    # Check if the response was successful
    if response.status_code == 200:
        # Extract the coordinates from the response
        data = response.json()
        lat = data['results'][0]['location']['lat']
        lng = data['results'][0]['location']['lng']

        # Update the event with the new coordinates
        event['lat'] = lat
        event['lng'] = lng
    else:
        print(f'Error geocoding {address}: {response.status_code}')

# Save the updated events to a new JSON file
with open('updated_events.json', 'w') as f:
    json.dump(events, f, indent=4)
