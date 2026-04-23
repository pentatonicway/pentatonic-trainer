import type { Progression, BoxData, NoteRoot, ChordQuality } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ALL_DEGREES_VISIBLE = {
  "1": true,
  "2": true,
  b3: true,
  "3": true,
  "4": true,
  b5: true,
  "5": true,
  b6: true,
  "6": true,
  b7: true,
  "7": true,
} as const;

let _counter = 0;
function presetId(slug: string): string {
  return `preset-${slug}-${++_counter}`;
}

function box(root: NoteRoot, quality: ChordQuality, index: number): BoxData {
  return {
    id: `preset-box-${root}-${quality}-${index}`,
    chordRoot: root,
    chordQuality: quality,
    shapeIndex: 0,
    transposeOffset: 0,
    locked: true,
    scaleDegreeVisibility: { ...ALL_DEGREES_VISIBLE },
  };
}

function prog(
  name: string,
  slug: string,
  chords: Array<[NoteRoot, ChordQuality]>,
  searchTerm?: string
): Progression {
  return {
    id: presetId(slug),
    name,
    searchTerm,
    boxes: chords.map(([root, quality], i) => box(root, quality, i)),
  };
}

// ─── Generic Progressions ─────────────────────────────────────────────────────

export const PRESETS: Progression[] = [
  prog("I–IV–V", "i-iv-v-major", [
    ["A", "major"],
    ["D", "major"],
    ["E", "major"],
  ]),
  prog("I–V–vi–IV", "i-v-vi-iv", [
    ["C", "major"],
    ["G", "major"],
    ["A", "minor"],
    ["F", "major"],
  ]),
  prog("12-Bar Blues", "12-bar-blues", [
    ["A", "dominant"],
    ["D", "dominant"],
    ["E", "dominant"],
  ]),
  prog("ii–V–I", "ii-v-i", [
    ["D", "minor"],
    ["G", "dominant"],
    ["C", "major"],
  ]),
  prog("I–vi–IV–V", "i-vi-iv-v", [
    ["C", "major"],
    ["A", "minor"],
    ["F", "major"],
    ["G", "major"],
  ]),
  prog("vi–IV–I–V", "vi-iv-i-v", [
    ["A", "minor"],
    ["F", "major"],
    ["C", "major"],
    ["G", "major"],
  ]),
  prog("I–IV–vi–V", "i-iv-vi-v", [
    ["G", "major"],
    ["C", "major"],
    ["E", "minor"],
    ["D", "major"],
  ]),
  prog("Blues Shuffle", "blues-shuffle", [
    ["E", "dominant"],
    ["A", "dominant"],
    ["B", "dominant"],
  ]),
  prog("Minor i–VII–VI", "minor-i-vii-vi", [
    ["A", "minor"],
    ["G", "major"],
    ["F", "major"],
  ]),
  prog("i–iv–v", "i-iv-v-minor", [
    ["A", "minor"],
    ["D", "minor"],
    ["E", "minor"],
  ]),
  prog("Jazz ii–V–I", "jazz-ii-v-i", [
    ["D", "minor"],
    ["G", "dominant"],
    ["C", "major"],
  ]),
  prog("Andalusian Cadence", "andalusian", [
    ["A", "minor"],
    ["G", "major"],
    ["F", "major"],
    ["E", "major"],
  ]),
  prog("50s Progression", "50s", [
    ["C", "major"],
    ["A", "minor"],
    ["F", "major"],
    ["G", "major"],
  ]),
  prog("Pachelbel", "pachelbel", [
    ["D", "major"],
    ["A", "major"],
    ["B", "minor"],
    ["F#", "minor"],
    ["G", "major"],
    ["E", "minor"],
  ]),
  prog("Minor Blues", "minor-blues", [
    ["A", "minor"],
    ["D", "minor"],
    ["E", "minor"],
  ]),
  prog("Pop Punk", "pop-punk", [
    ["G", "major"],
    ["D", "major"],
    ["E", "minor"],
    ["C", "major"],
  ]),

  // ─── Rock ─────────────────────────────────────────────────────────────────

  prog(
    "Knockin on Heavens Door – Dylan",
    "knockin-heavens-door",
    [
      ["G", "major"],
      ["D", "major"],
      ["A", "minor"],
      ["C", "major"],
    ],
    "Knockin on Heavens Door Dylan"
  ),

  prog(
    "Brown Eyed Girl – Van Morrison",
    "brown-eyed-girl",
    [
      ["G", "major"],
      ["C", "major"],
      ["D", "major"],
    ],
    "Brown Eyed Girl Van Morrison"
  ),

  prog(
    "La Grange – ZZ Top",
    "la-grange",
    [
      ["A", "dominant"],
      ["D", "dominant"],
      ["E", "dominant"],
    ],
    "La Grange ZZ Top"
  ),

  prog(
    "Paranoid – Black Sabbath",
    "paranoid",
    [
      ["E", "minor"],
      ["D", "major"],
      ["C", "major"],
    ],
    "Paranoid Black Sabbath"
  ),

  prog(
    "Sweet Home Alabama – Lynyrd Skynyrd",
    "sweet-home-alabama",
    [
      ["D", "major"],
      ["C", "major"],
      ["G", "major"],
    ],
    "Sweet Home Alabama Lynyrd Skynyrd"
  ),

  prog(
    "Born to Run – Springsteen",
    "born-to-run",
    [
      ["E", "major"],
      ["A", "major"],
      ["B", "major"],
    ],
    "Born to Run Bruce Springsteen"
  ),

  prog(
    "Smoke on the Water – Deep Purple",
    "smoke-on-the-water",
    [
      ["G", "minor"],
      ["A#", "major"],
      ["C", "major"],
    ],
    "Smoke on the Water Deep Purple"
  ),

  prog(
    "Whole Lotta Love – Led Zeppelin",
    "whole-lotta-love",
    [
      ["E", "dominant"],
      ["A", "dominant"],
    ],
    "Whole Lotta Love Led Zeppelin"
  ),

  prog(
    "Back in Black – AC/DC",
    "back-in-black",
    [
      ["E", "major"],
      ["D", "major"],
      ["A", "major"],
    ],
    "Back in Black ACDC"
  ),

  prog(
    "Highway to Hell – AC/DC",
    "highway-to-hell",
    [
      ["A", "major"],
      ["D", "major"],
      ["G", "major"],
    ],
    "Highway to Hell ACDC"
  ),

  prog(
    "Comfortably Numb – Pink Floyd",
    "comfortably-numb",
    [
      ["B", "minor"],
      ["A", "major"],
      ["G", "major"],
      ["E", "minor"],
    ],
    "Comfortably Numb Pink Floyd"
  ),

  prog(
    "Wish You Were Here – Pink Floyd",
    "wish-you-were-here",
    [
      ["C", "major"],
      ["D", "minor"],
      ["E", "minor"],
      ["G", "major"],
      ["A", "minor"],
    ],
    "Wish You Were Here Pink Floyd"
  ),

  prog(
    "Stairway to Heaven – Led Zeppelin",
    "stairway-to-heaven",
    [
      ["A", "minor"],
      ["G", "major"],
      ["F", "major"],
      ["C", "major"],
      ["D", "minor"],
      ["E", "major"],
    ],
    "Stairway to Heaven Led Zeppelin"
  ),

  prog(
    "More Than a Feeling – Boston",
    "more-than-a-feeling",
    [
      ["D", "major"],
      ["C", "major"],
      ["G", "major"],
      ["B", "minor"],
      ["E", "minor"],
      ["A", "major"],
    ],
    "More Than a Feeling Boston"
  ),

  prog(
    "Eye of the Tiger – Survivor",
    "eye-of-the-tiger",
    [
      ["C", "minor"],
      ["A#", "major"],
      ["G#", "major"],
      ["G", "major"],
    ],
    "Eye of the Tiger Survivor"
  ),

  prog(
    "Jump – Van Halen",
    "jump",
    [
      ["C", "major"],
      ["F", "major"],
      ["G", "major"],
      ["A", "minor"],
    ],
    "Jump Van Halen"
  ),

  prog(
    "Pour Some Sugar on Me – Def Leppard",
    "pour-some-sugar",
    [
      ["B", "major"],
      ["E", "major"],
      ["A", "major"],
    ],
    "Pour Some Sugar on Me Def Leppard"
  ),

  prog(
    "Livin on a Prayer – Bon Jovi",
    "livin-on-a-prayer",
    [
      ["E", "minor"],
      ["C", "major"],
      ["D", "major"],
    ],
    "Livin on a Prayer Bon Jovi"
  ),

  prog(
    "Wanted Dead or Alive – Bon Jovi",
    "wanted-dead-or-alive",
    [
      ["D", "major"],
      ["A", "major"],
      ["G", "major"],
      ["F", "major"],
      ["C", "major"],
    ],
    "Wanted Dead or Alive Bon Jovi"
  ),

  prog(
    "Sultans of Swing – Dire Straits",
    "sultans-of-swing",
    [
      ["D", "minor"],
      ["C", "major"],
      ["A#", "major"],
      ["A", "major"],
      ["F", "major"],
    ],
    "Sultans of Swing Dire Straits"
  ),

  // ─── Blues ────────────────────────────────────────────────────────────────

  prog(
    "Sweet Home Chicago – Robert Johnson",
    "sweet-home-chicago",
    [
      ["E", "dominant"],
      ["A", "dominant"],
      ["B", "dominant"],
    ],
    "Sweet Home Chicago Robert Johnson"
  ),

  prog(
    "The Thrill is Gone – BB King",
    "thrill-is-gone",
    [
      ["B", "minor"],
      ["E", "minor"],
      ["G", "major"],
      ["F#", "dominant"],
    ],
    "The Thrill is Gone BB King"
  ),

  prog(
    "Pride and Joy – SRV",
    "pride-and-joy",
    [
      ["E", "dominant"],
      ["A", "dominant"],
      ["B", "dominant"],
    ],
    "Pride and Joy Stevie Ray Vaughan"
  ),

  prog(
    "Texas Flood – SRV",
    "texas-flood",
    [
      ["G", "dominant"],
      ["C", "dominant"],
      ["D", "dominant"],
    ],
    "Texas Flood Stevie Ray Vaughan"
  ),

  prog(
    "Crossroads – Cream",
    "crossroads",
    [
      ["A", "dominant"],
      ["D", "dominant"],
      ["E", "dominant"],
    ],
    "Crossroads Cream"
  ),

  prog(
    "Red House – Jimi Hendrix",
    "red-house",
    [
      ["B", "dominant"],
      ["E", "dominant"],
      ["F#", "dominant"],
    ],
    "Red House Jimi Hendrix"
  ),

  prog(
    "Stormy Monday – T-Bone Walker",
    "stormy-monday",
    [
      ["G", "dominant"],
      ["C", "dominant"],
      ["E", "dominant"],
      ["A", "minor"],
      ["D", "dominant"],
    ],
    "Stormy Monday T-Bone Walker"
  ),

  prog(
    "Hoochie Coochie Man – Muddy Waters",
    "hoochie-coochie-man",
    [
      ["A", "dominant"],
      ["D", "dominant"],
      ["E", "dominant"],
    ],
    "Hoochie Coochie Man Muddy Waters"
  ),

  prog(
    "Born Under a Bad Sign – Albert King",
    "born-under-bad-sign",
    [
      ["C#", "dominant"],
      ["F#", "dominant"],
      ["G#", "dominant"],
    ],
    "Born Under a Bad Sign Albert King"
  ),

  prog(
    "I Got My Mojo Working – Muddy Waters",
    "mojo-working",
    [
      ["F", "dominant"],
      ["A#", "dominant"],
      ["C", "dominant"],
    ],
    "Got My Mojo Working Muddy Waters"
  ),

  // ─── Pop ──────────────────────────────────────────────────────────────────

  prog(
    "Let It Be – Beatles",
    "let-it-be",
    [
      ["C", "major"],
      ["G", "major"],
      ["A", "minor"],
      ["F", "major"],
    ],
    "Let It Be Beatles"
  ),

  prog(
    "Hey Jude – Beatles",
    "hey-jude",
    [
      ["F", "major"],
      ["C", "major"],
      ["C", "dominant"],
      ["A#", "major"],
    ],
    "Hey Jude Beatles"
  ),

  prog(
    "Blackbird – Beatles",
    "blackbird",
    [
      ["G", "major"],
      ["A", "minor"],
      ["F", "major"],
      ["C", "major"],
      ["D", "minor"],
      ["D", "major"],
    ],
    "Blackbird Beatles"
  ),

  prog(
    "No Woman No Cry – Bob Marley",
    "no-woman-no-cry",
    [
      ["C", "major"],
      ["G", "major"],
      ["A", "minor"],
      ["F", "major"],
    ],
    "No Woman No Cry Bob Marley"
  ),

  prog(
    "Redemption Song – Bob Marley",
    "redemption-song",
    [
      ["G", "major"],
      ["E", "minor"],
      ["C", "major"],
      ["D", "major"],
      ["A", "minor"],
    ],
    "Redemption Song Bob Marley"
  ),

  prog(
    "Three Little Birds – Bob Marley",
    "three-little-birds",
    [
      ["A", "major"],
      ["D", "major"],
      ["E", "major"],
    ],
    "Three Little Birds Bob Marley"
  ),

  prog(
    "Stand By Me – Ben E King",
    "stand-by-me",
    [
      ["A", "major"],
      ["F#", "minor"],
      ["D", "major"],
      ["E", "major"],
    ],
    "Stand By Me Ben E King"
  ),

  prog(
    "Wonderful Tonight – Clapton",
    "wonderful-tonight",
    [
      ["G", "major"],
      ["D", "major"],
      ["C", "major"],
      ["E", "minor"],
    ],
    "Wonderful Tonight Eric Clapton"
  ),

  prog(
    "Layla – Clapton Unplugged",
    "layla-unplugged",
    [
      ["C", "minor"],
      ["G", "major"],
      ["A#", "major"],
      ["C", "major"],
      ["F", "minor"],
      ["G", "minor"],
    ],
    "Layla Eric Clapton unplugged"
  ),

  prog(
    "Shape of You – Ed Sheeran",
    "shape-of-you",
    [
      ["C#", "minor"],
      ["F#", "minor"],
      ["A", "major"],
      ["B", "major"],
    ],
    "Shape of You Ed Sheeran"
  ),

  prog(
    "Thinking Out Loud – Ed Sheeran",
    "thinking-out-loud",
    [
      ["D", "major"],
      ["G", "major"],
      ["A", "major"],
      ["B", "minor"],
    ],
    "Thinking Out Loud Ed Sheeran"
  ),

  prog(
    "Someone Like You – Adele",
    "someone-like-you",
    [
      ["A", "major"],
      ["E", "major"],
      ["F#", "minor"],
      ["D", "major"],
    ],
    "Someone Like You Adele"
  ),

  prog(
    "Rolling in the Deep – Adele",
    "rolling-in-the-deep",
    [
      ["C", "minor"],
      ["A#", "major"],
      ["G", "minor"],
      ["G", "major"],
    ],
    "Rolling in the Deep Adele"
  ),

  prog(
    "Hotel California – Eagles",
    "hotel-california",
    [
      ["B", "minor"],
      ["F#", "major"],
      ["A", "major"],
      ["E", "major"],
      ["G", "major"],
      ["D", "major"],
      ["E", "minor"],
    ],
    "Hotel California Eagles"
  ),

  prog(
    "Take It Easy – Eagles",
    "take-it-easy",
    [
      ["G", "major"],
      ["D", "major"],
      ["C", "major"],
      ["E", "minor"],
      ["A", "minor"],
    ],
    "Take It Easy Eagles"
  ),

  // ─── Country ──────────────────────────────────────────────────────────────

  prog(
    "Ring of Fire – Johnny Cash",
    "ring-of-fire",
    [
      ["G", "major"],
      ["C", "major"],
      ["D", "major"],
    ],
    "Ring of Fire Johnny Cash"
  ),

  prog(
    "Folsom Prison Blues – Johnny Cash",
    "folsom-prison-blues",
    [
      ["G", "major"],
      ["C", "major"],
      ["D", "major"],
    ],
    "Folsom Prison Blues Johnny Cash"
  ),

  prog(
    "Friends in Low Places – Garth Brooks",
    "friends-low-places",
    [
      ["A", "major"],
      ["B", "minor"],
      ["E", "major"],
    ],
    "Friends in Low Places Garth Brooks"
  ),

  prog(
    "Take Me Home Country Roads – Denver",
    "country-roads",
    [
      ["G", "major"],
      ["E", "minor"],
      ["C", "major"],
      ["D", "major"],
    ],
    "Take Me Home Country Roads John Denver"
  ),

  prog(
    "Jolene – Dolly Parton",
    "jolene",
    [
      ["A", "minor"],
      ["C", "major"],
      ["G", "major"],
    ],
    "Jolene Dolly Parton"
  ),

  prog(
    "Wagon Wheel – Old Crow Medicine Show",
    "wagon-wheel",
    [
      ["G", "major"],
      ["D", "major"],
      ["E", "minor"],
      ["C", "major"],
    ],
    "Wagon Wheel Old Crow Medicine Show"
  ),

  prog(
    "Tennessee Whiskey – Chris Stapleton",
    "tennessee-whiskey",
    [
      ["A", "major"],
      ["B", "minor"],
    ],
    "Tennessee Whiskey Chris Stapleton"
  ),

  prog(
    "Mama Tried – Merle Haggard",
    "mama-tried",
    [
      ["G", "major"],
      ["C", "major"],
      ["D", "major"],
    ],
    "Mama Tried Merle Haggard"
  ),

  // ─── Soul & R&B ───────────────────────────────────────────────────────────

  prog(
    "Superstition – Stevie Wonder",
    "superstition",
    [
      ["E", "minor"],
      ["A", "minor"],
    ],
    "Superstition Stevie Wonder"
  ),

  prog(
    "Higher Ground – Stevie Wonder",
    "higher-ground",
    [
      ["E", "minor"],
      ["G", "major"],
      ["A", "minor"],
      ["C", "major"],
      ["D", "major"],
    ],
    "Higher Ground Stevie Wonder"
  ),

  prog(
    "Signed Sealed Delivered – Stevie Wonder",
    "signed-sealed",
    [
      ["F", "major"],
      ["A#", "major"],
      ["C", "dominant"],
      ["G", "minor"],
    ],
    "Signed Sealed Delivered Stevie Wonder"
  ),

  prog(
    "I Heard It Through the Grapevine – Marvin Gaye",
    "grapevine",
    [
      ["E", "minor"],
      ["A", "minor"],
      ["B", "minor"],
      ["G", "major"],
    ],
    "I Heard It Through the Grapevine Marvin Gaye"
  ),

  prog(
    "Respect – Aretha Franklin",
    "respect",
    [
      ["C", "major"],
      ["F", "major"],
      ["G", "major"],
    ],
    "Respect Aretha Franklin"
  ),

  prog(
    "Mustang Sally – Wilson Pickett",
    "mustang-sally",
    [
      ["C", "dominant"],
      ["F", "dominant"],
      ["G", "dominant"],
    ],
    "Mustang Sally Wilson Pickett"
  ),

  prog(
    "Green Onions – Booker T",
    "green-onions",
    [
      ["F", "dominant"],
      ["A#", "dominant"],
      ["C", "dominant"],
    ],
    "Green Onions Booker T"
  ),

  prog(
    "Use Me – Bill Withers",
    "use-me",
    [
      ["G", "minor"],
      ["C", "dominant"],
    ],
    "Use Me Bill Withers"
  ),

  prog(
    "Lean on Me – Bill Withers",
    "lean-on-me",
    [
      ["C", "major"],
      ["E", "minor"],
      ["F", "major"],
      ["G", "major"],
      ["A", "minor"],
    ],
    "Lean on Me Bill Withers"
  ),

  prog(
    "Sittin on the Dock of the Bay – Otis Redding",
    "dock-of-the-bay",
    [
      ["G", "major"],
      ["B", "major"],
      ["C", "major"],
      ["A", "major"],
      ["E", "minor"],
      ["D", "minor"],
    ],
    "Sittin on the Dock of the Bay Otis Redding"
  ),

  // ─── Classic Rock ─────────────────────────────────────────────────────────

  prog(
    "Sympathy for the Devil – Rolling Stones",
    "sympathy-for-devil",
    [
      ["E", "major"],
      ["A", "major"],
      ["B", "major"],
    ],
    "Sympathy for the Devil Rolling Stones"
  ),

  prog(
    "Paint It Black – Rolling Stones",
    "paint-it-black",
    [
      ["E", "minor"],
      ["B", "major"],
      ["D", "major"],
      ["A", "major"],
      ["C", "major"],
      ["G", "major"],
    ],
    "Paint It Black Rolling Stones"
  ),

  prog(
    "Wild Horses – Rolling Stones",
    "wild-horses",
    [
      ["G", "major"],
      ["A", "minor"],
      ["C", "major"],
      ["D", "major"],
      ["F", "major"],
      ["B", "minor"],
    ],
    "Wild Horses Rolling Stones"
  ),

  prog(
    "All Along the Watchtower – Hendrix",
    "all-along-watchtower",
    [
      ["C#", "minor"],
      ["B", "major"],
      ["A", "major"],
    ],
    "All Along the Watchtower Jimi Hendrix"
  ),

  prog(
    "Purple Haze – Jimi Hendrix",
    "purple-haze",
    [
      ["E", "dominant"],
      ["G", "major"],
      ["A", "major"],
    ],
    "Purple Haze Jimi Hendrix"
  ),

  prog(
    "Light My Fire – The Doors",
    "light-my-fire",
    [
      ["A", "minor"],
      ["F#", "minor"],
      ["G", "major"],
      ["A", "major"],
      ["D", "major"],
      ["E", "major"],
    ],
    "Light My Fire The Doors"
  ),

  prog(
    "People Are Strange – The Doors",
    "people-are-strange",
    [
      ["E", "minor"],
      ["B", "major"],
      ["A", "minor"],
      ["D", "major"],
      ["G", "major"],
    ],
    "People Are Strange The Doors"
  ),

  prog(
    "For What Its Worth – Buffalo Springfield",
    "for-what-its-worth",
    [
      ["E", "major"],
      ["A", "major"],
    ],
    "For What Its Worth Buffalo Springfield"
  ),

  prog(
    "Heart of Gold – Neil Young",
    "heart-of-gold",
    [
      ["E", "minor"],
      ["C", "major"],
      ["D", "major"],
      ["G", "major"],
    ],
    "Heart of Gold Neil Young"
  ),

  prog(
    "Old Man – Neil Young",
    "old-man",
    [
      ["D", "major"],
      ["A", "major"],
      ["G", "major"],
      ["E", "minor"],
      ["C", "major"],
    ],
    "Old Man Neil Young"
  ),

  prog(
    "Fire and Rain – James Taylor",
    "fire-and-rain",
    [
      ["G", "major"],
      ["A", "minor"],
      ["C", "major"],
      ["D", "major"],
      ["E", "minor"],
      ["B", "minor"],
    ],
    "Fire and Rain James Taylor"
  ),

  prog(
    "Mexico – James Taylor",
    "mexico",
    [
      ["E", "minor"],
      ["A", "minor"],
      ["D", "major"],
      ["G", "major"],
      ["C", "major"],
    ],
    "Mexico James Taylor"
  ),
];

export const VALID_ROOTS = new Set<string>([
  "A",
  "A#",
  "Bb",
  "B",
  "C",
  "C#",
  "Db",
  "D",
  "D#",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "G#",
  "Ab",
]);

export const VALID_QUALITIES = new Set<string>(["major", "minor", "dominant"]);
