import { getEvents } from "../services/events"; // Assuming you have a service to get events

export const countEventsAddedInLastWeek = async () => {
  const events = await getEvents();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const eventsAddedInLastWeek = events.filter(
    (event) => new Date(event.addedDate) >= oneWeekAgo
  );
  return eventsAddedInLastWeek.length;
};
