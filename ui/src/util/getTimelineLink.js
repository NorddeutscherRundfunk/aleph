export default function getTimelineLink(timeline) {
  return (timeline && timeline.id) ? `/timelines/${timeline.id}` : null;
}
