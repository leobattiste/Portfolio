/* The Playground's text: what the pages say, shared by the build, the site
   and the admin. Anything saved in the admin replaces it field by field. */

export const defaultRatios = [
  {
    value: 1.33,
    name: "Standard",
    note: "4:3",
    film: "The Artist (2011)",
    essay: ["Cinema began here. In the 1890s Edison's lab settled on a frame about a third wider than it was tall, and for decades nobody had a reason to change it. Television inherited the shape, so for half a century it was also what a living room looked like.", "The frame is tall and close. A face fills it easily, a doorway turns into a portrait, and there is little room for anything that does not matter. Filmmakers who choose it today usually want that pressure: intimacy, nostalgia, or the feeling of being boxed in."],
    fact: "The Grand Budapest Hotel uses a near-4:3 frame for its 1930s scenes, then widens the picture for each later decade.",
  },
  {
    value: 1.43,
    name: "IMAX",
    film: "The Odyssey (2026)",
    essay: ["IMAX 15/70 is the largest frame in regular film use. The film runs through the camera on its side, and each frame spans fifteen perforations, which makes it almost square and roughly ten times the area of a regular 35mm frame. More area means less grain and more detail, so the picture stays sharp on a screen several stories tall.", "The cost is practical. The cameras are heavy and loud, a roll of film lasts only a few minutes, and only some theaters can show it at full size. Christopher Nolan has pushed the format further than anyone, and he shot The Odyssey entirely for IMAX."],
    fact: "IMAX film projectors hold each frame flat against the lens with suction, which keeps a frame this large perfectly sharp.",
  },
  {
    value: 1.78,
    name: "Widescreen",
    note: "16:9",
    film: "Whatever you watch at home",
    essay: ["16:9 was never a cinema standard. It was proposed in the 1980s for television as a compromise: take the old 4:3 shape and the widest film shape, and find a rectangle that wastes about the same amount of screen on both.", "It stuck, and now it is everywhere: TVs, laptops, phones turned sideways, YouTube. For films it works mostly as the container. A scope film on this screen gets bars above and below, and a 4:3 film gets bars at the sides. It is also the shape of the frame in this experiment, so every other ratio here is shown as bars inside it."],
    fact: "Almost every screen you own is 16:9, which means almost every film you watch has been resized to fit it.",
  },
  {
    value: 1.85,
    name: "Flat",
    film: "Pulp Fiction (1994)",
    essay: ["Flat is the quiet default. It is wide enough for two people to share a shot and tall enough to keep their faces large, so it is what most dramas and comedies use. Conversations get by with nothing but faces and a table, like the diner scenes in Pulp Fiction.", "The name comes from the lenses. Flat uses ordinary spherical lenses, with no squeezing, where scope needs special anamorphic ones. Because it asks nothing special of the audience, it is the ratio you notice least, and that is often the point."],
    fact: "Flat sits so close to 16:9 that most people never notice the thin bars it gets at home.",
  },
  {
    value: 2.39,
    name: "Scope",
    film: "Blade Runner 2049 (2017)",
    essay: ["Scope began as a reply to television. In the 1950s studios needed a reason to get people out of their living rooms, and CinemaScope, introduced with The Robe in 1953, offered a much wider picture. It does this with anamorphic lenses that squeeze the image onto the film and stretch it back out on screen. The ratio settled at 2.39 over the following decades.", "The look has side effects that people now love: oval blurred highlights and long horizontal streaks of light. The shape favors landscapes and distance. Two characters can stand far apart and still share a frame, and the empty space between them becomes part of the scene."],
    fact: "Scope is the ratio most people think of as cinematic, which is why creators on YouTube and in games often add black bars to get the look.",
  },
  {
    value: 2.76,
    name: "Ultra Panavision",
    film: "The Hateful Eight (2015)",
    essay: ["Ultra Panavision 70 is the widest frame in use. It squeezes a picture more than two and a half times as wide as it is tall onto 65mm film. It was made for epics in the 1950s and 60s, like Ben-Hur in 1959, and then almost disappeared.", "Quentin Tarantino brought it back for The Hateful Eight, shot with lenses made in the 1960s, and used it on a story set mostly in one room. That is the surprise: the extreme width does not make the cabin feel bigger, it makes it feel crowded, with every character in the shot at once."],
    fact: "The Hateful Eight was shown in a 70mm roadshow cut with an overture and an intermission, the way epics were released in the 1960s.",
  },
];

export const defaultPlayground = {
  title: "Playground",
  intro: "Small experiments. Loose ideas.\nThings made just to see what happens.",
  description: "Small experiments and loose ideas, made to see what happens.",
  aspect: {
    cardTitle: "Aspect ratio",
    cardBlurb: "Six ways to frame a film. Drag to see what each one hides.",
    lead: "Six ways to frame a film.\nDrag to see what each one leaves out.",
    description:
      "Six film aspect ratios, from 4:3 to Ultra Panavision, with a movie and a fun fact for each. Drag to see what each one leaves out.",
    notes: [
      "<p>Watching movies is one of my favorite hobbies, and it changed how I design. I notice the frame before the plot: where the edges sit, what gets cropped, and how much room a shot leaves to breathe. A screen layout makes the same decisions.</p>",
      "<p>Narrow the frame to 4:3 and the lighthouse on the right drops out of the picture. Nothing in the scene changed, only what it showed.</p>",
      "<p>The bars move on a spring rather than a fixed curve, so every change, even mid-drag, reads as one continuous motion.</p>",
    ].join(""),
    ratios: defaultRatios,
  },
};

/* Saved text over the defaults. Ratios are matched by their number, so the
   list can't lose or gain an entry from the admin. */
export function mergePlayground(base, saved) {
  if (!saved || typeof saved !== "object") return base;
  const text = (v, fallback) => (typeof v === "string" && v.trim() ? v : fallback);
  const a = saved.aspect || {};
  return {
    title: text(saved.title, base.title),
    intro: text(saved.intro, base.intro),
    description: text(saved.description, base.description),
    aspect: {
      cardTitle: text(a.cardTitle, base.aspect.cardTitle),
      cardBlurb: text(a.cardBlurb, base.aspect.cardBlurb),
      lead: text(a.lead, base.aspect.lead),
      description: text(a.description, base.aspect.description),
      notes: text(a.notes, base.aspect.notes),
      ratios: base.aspect.ratios.map((r) => {
        const s = (Array.isArray(a.ratios) ? a.ratios : []).find((x) => x && x.value === r.value) || {};
        return {
          value: r.value,
          name: text(s.name, r.name),
          note: typeof s.note === "string" ? s.note : r.note,
          film: text(s.film, r.film),
          fact: text(s.fact, r.fact),
          essay:
            Array.isArray(s.essay) && s.essay.some((p) => typeof p === "string" && p.trim())
              ? s.essay.filter((p) => typeof p === "string" && p.trim())
              : r.essay,
        };
      }),
    },
  };
}
