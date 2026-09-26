const photo = (s: string) => "/assets/photos/" + s + ".jpg";
const serviceData = [
  [
    "wedding-planning",
    "Weddings",
    "A celebration.\nEntirely your own.",
    "From the first welcome to the final farewell, we connect your rituals, your people, and your personal style.",
    "hero-mandap-gold",
    "Weddings",
    "Ceremonies & celebrations|Mandap & floral styling|Guest experience|On-the-day coordination",
    "Number of functions|Venue & guest count|Floral density & materials|Production & hospitality",
  ],
  [
    "corporate-events",
    "Corporate events",
    "Make room\nfor a bigger idea.",
    "Conferences, launches, and company celebrations built around the people you want to bring together.",
    "conference-stage",
    "Corporate",
    "Event planning & scheduling|Stage, sound & lighting|Brand styling|Registration & guest flow",
    "Audience size|Venue & duration|Technical production|Branding & hospitality",
  ],
  [
    "custom-decor",
    "Décor & styling",
    "A space that\nsays everything.",
    "From a statement entrance to the smallest table detail, a visual world shaped around your occasion.",
    "red-floral-dinner",
    "Décor",
    "Mood & colour direction|Florals & installations|Stage & entrance styling|Setup & finishing",
    "Area to be styled|Fresh flowers & materials|Custom fabrication|Transport & installation",
  ],
  [
    "destination-events",
    "Destination events",
    "A new place.\nA lasting feeling.",
    "Bring the celebration somewhere special, with planning that considers the journey as carefully as the event.",
    "beach-ceremony",
    "Destinations",
    "Venue coordination|Local vendor planning|Guest movement|Multi-day event schedules",
    "Destination & season|Rooms & guest travel|Local sourcing|Number of celebration days",
  ],
  [
    "navratri-events",
    "Festive celebrations",
    "Tradition,\nturned all the way up.",
    "Navratri, festive gatherings, and cultural celebrations with colour, atmosphere, and a thoughtful flow.",
    "live-stage",
    "Celebrations",
    "Themed festive décor|Stage & performance planning|Lighting & atmosphere|Guest & crowd coordination",
    "Event duration|Venue capacity|Entertainment & production|Décor & operations",
  ],
  [
    "hospitality-management",
    "Hospitality",
    "Make everyone\nfeel expected.",
    "A considered guest experience, from the welcome desk to the final goodbye.",
    "ballroom-chandeliers",
    "Corporate",
    "Guest welcomes|Seating & movement|Vendor coordination|On-site guest assistance",
    "Guest count|Service hours|Staffing & responsibilities|Venue requirements",
  ],
  [
    "private-celebrations",
    "Private celebrations",
    "A little occasion.\nA big feeling.",
    "Birthdays, anniversaries, and intimate gatherings made personal through décor, details, and care.",
    "birthday-balloons",
    "Celebrations",
    "Personalised styling|Celebration backdrops|Entertainment coordination|Setup & event support",
    "Guest count & venue|Styling complexity|Entertainment|Food & hospitality scope",
  ],
];
export const servicePagesPreset = {
  eyebrow: "From idea to incredible",
  title: "Every occasion.\nOur full attention.",
  description:
    "Choose your occasion to explore the details, understand what shapes the budget, and see how we bring it together.",
  items: serviceData.map(
    ([slug, title, headline, description, img, category, scope, budget]) => ({
      slug,
      title,
      headline,
      description,
      image: photo(img),
      alt: title + " event setting",
      category,
      scope: scope
        .split("|")
        .map((title, i) => ({
          title,
          description: [
            "We agree the priorities with you before planning the details.",
            "A cohesive direction, refined around your venue and preferences.",
            "Thoughtful coordination to keep the experience connected.",
            "A clear plan for the team, timings, and finishing touches.",
          ][i],
        })),
      budgetFactors: budget
        .split("|")
        .map((title, i) => ({
          title,
          description: [
            "The starting point for your scope and quotation.",
            "Availability, scale, and the choices you make affect this part.",
            "We compare options so you can see where the investment goes.",
            "Confirmed in the written proposal before you commit.",
          ][i],
        })),
      deliverables:
        "A tailored scope, a clear quotation, and a planning timeline — discussed together before booking.",
      enabled: true,
    }),
  ),
};
export const planningPreset = {
  enabled: true,
  eyebrow: "A clear path to your celebration",
  title: "Beautifully imagined.\nThoughtfully planned.",
  description:
    "You bring the occasion. We bring structure, creative direction, and the details that make it feel like you.",
  steps: [
    {
      title: "Share the occasion",
      description:
        "Your date, city, approximate guest count, and the feeling you want to create.",
    },
    {
      title: "Choose your direction",
      description:
        "Browse the gallery and save a few favourites. We use them to understand your style.",
    },
    {
      title: "Shape the scope",
      description:
        "Together, we identify what matters most and review options within your budget.",
    },
    {
      title: "Bring it to life",
      description:
        "Once the proposal is agreed, we coordinate the plan, people, and event-day details.",
    },
  ],
  budgetTitle: "A budget built\naround your priorities.",
  budgetDescription:
    "There is no one-size-fits-all event price. Your venue, guest count, décor, production, and hospitality shape the quotation. We make those choices visible before you decide.",
  budgetNote:
    "Final inclusions, costs, payment stages, and any changes are agreed in your written proposal. This guide explains the process; it is not a quotation.",
  budgetItems: [
    {
      title: "The setting",
      description: "Venue, dates, access, and guest count.",
    },
    {
      title: "The atmosphere",
      description: "Flowers, materials, styling, and installations.",
    },
    {
      title: "The experience",
      description: "Sound, lighting, entertainment, and hospitality.",
    },
    {
      title: "The delivery",
      description: "People, logistics, setup, and coordination.",
    },
  ],
};
export const nextStepsPreset = {
  enabled: true,
  eyebrow: "After you get in touch",
  title: "A conversation first.\nA celebration next.",
  description:
    "No need to have every detail decided. Tell us what you know, and we will help you shape the rest.",
  items: [
    {
      title: "We understand your brief",
      description:
        "We discuss the occasion, your preferred date, the venue, and what you want your guests to feel.",
    },
    {
      title: "You review the direction",
      description:
        "We walk through the creative approach, the proposed scope, and the choices that influence cost.",
    },
    {
      title: "We agree the plan",
      description:
        "When you are ready, we confirm responsibilities, a timeline, and the booking details in writing.",
    },
  ],
};
export const collectionPreset = {
  title: "Find your kind\nof extraordinary.",
  description:
    "Explore by occasion, discover the details, and save the ideas you love. Share a collection with your family or send your shortlist to our team.",
  featuredTitle: "In the spotlight.",
  featuredDescription:
    "Selected settings, details, and celebrations to explore.",
  showFeatured: true,
};
