import "./interactive-map.css";

type MapLocation = {
  id: string;
  top: string;
  left: string;
  title: string;
  description: string;
};

const MAP_LOCATIONS: MapLocation[] = [
  {
    id: "hong-kong",
    top: "38%",
    left: "75%",
    title: "Hong Kong",
    description: "Regional crew coordination hub for Asia-Pacific deployments.",
  },
  {
    id: "mumbai",
    top: "42%",
    left: "62%",
    title: "Mumbai",
    description: "Manning partner office and document processing centre.",
  },
  {
    id: "london",
    top: "28%",
    left: "48%",
    title: "London",
    description: "Fleet operations and chartering support.",
  },
  {
    id: "manila",
    top: "40%",
    left: "78%",
    title: "Manila",
    description: "Crew sourcing and pre-embarkation training.",
  },
  {
    id: "prince-rupert",
    top: "22%",
    left: "12%",
    title: "Prince Rupert",
    description: "Pacific Northwest port liaison and logistics.",
  },
  {
    id: "sydney",
    top: "72%",
    left: "88%",
    title: "Sydney",
    description: "Southern hemisphere operations and compliance.",
  },
];

export default function InteractiveMap() {
  return (
    <section className="interactive-map" aria-label="Global office locations">
      <div className="interactive-map__inner">
        <img src="/world-map.png" alt="World map showing office locations" />
        {MAP_LOCATIONS.map((location) => (
          <button
            key={location.id}
            type="button"
            className="map-point"
            style={{ top: location.top, left: location.left }}
            aria-label={location.title}
          >
            <div className="content">
              <div className="centered-y">
                <h2>{location.title}</h2>
                <p>{location.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
