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
  chords: Array<[NoteRoot, ChordQuality]>
): Progression {
  return {
    id: presetId(slug),
    name,
    boxes: chords.map(([root, quality], i) => box(root, quality, i)),
  };
}

// ─── Generic Progressions ────────────────────────────────────────────────────

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
    ["A", "dominant"],
    ["A", "dominant"],
    ["A", "dominant"],
    ["D", "dominant"],
    ["D", "dominant"],
    ["A", "dominant"],
    ["A", "dominant"],
    ["E", "dominant"],
    ["D", "dominant"],
    ["A", "dominant"],
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
    ["D", "major"],
    ["G", "major"],
    ["A", "major"],
  ]),
  prog("Minor Blues", "minor-blues", [
    ["A", "minor"],
    ["D", "minor"],
    ["A", "minor"],
    ["E", "minor"],
    ["D", "minor"],
    ["A", "minor"],
  ]),
  prog("Pop Punk", "pop-punk", [
    ["G", "major"],
    ["D", "major"],
    ["E", "minor"],
    ["C", "major"],
  ]),

  // ─── Rock ────────────────────────────────────────────────────────────────

  prog("Knockin on Heavens Door – Dylan", "knockin-heavens-door", [
    ["G", "major"],
    ["D", "major"],
    ["A", "minor"],
    ["G", "major"],
    ["D", "major"],
    ["C", "major"],
  ]),
  prog("Brown Eyed Girl – Van Morrison", "brown-eyed-girl", [
    ["G", "major"],
    ["C", "major"],
    ["G", "major"],
    ["D", "major"],
  ]),
  prog("La Grange – ZZ Top", "la-grange", [
    ["A", "dominant"],
    ["D", "dominant"],
    ["E", "dominant"],
  ]),
  prog("Paranoid – Black Sabbath", "paranoid", [
    ["E", "minor"],
    ["D", "major"],
    ["C", "major"],
    ["D", "major"],
  ]),
  prog("Sweet Home Alabama – Lynyrd Skynyrd", "sweet-home-alabama", [
    ["D", "major"],
    ["C", "major"],
    ["G", "major"],
  ]),
  prog("Born to Run – Springsteen", "born-to-run", [
    ["E", "major"],
    ["A", "major"],
    ["B", "major"],
    ["A", "major"],
  ]),
  prog("Smoke on the Water – Deep Purple", "smoke-on-the-water", [
    ["G", "minor"],
    ["A#", "major"],
    ["C", "major"],
  ]),
  prog("Whole Lotta Love – Led Zeppelin", "whole-lotta-love", [
    ["E", "dominant"],
    ["A", "dominant"],
  ]),
  prog("Back in Black – AC/DC", "back-in-black", [
    ["E", "major"],
    ["D", "major"],
    ["A", "major"],
  ]),
  prog("Highway to Hell – AC/DC", "highway-to-hell", [
    ["A", "major"],
    ["D", "major"],
    ["G", "major"],
    ["D", "major"],
  ]),
  prog("Comfortably Numb – Pink Floyd", "comfortably-numb", [
    ["B", "minor"],
    ["A", "major"],
    ["G", "major"],
    ["E", "minor"],
  ]),
  prog("Wish You Were Here – Pink Floyd", "wish-you-were-here", [
    ["C", "major"],
    ["D", "minor"],
    ["E", "minor"],
    ["G", "major"],
  ]),
  prog("Stairway to Heaven – Led Zeppelin", "stairway-to-heaven", [
    ["A", "minor"],
    ["G", "major"],
    ["F", "major"],
    ["G", "major"],
  ]),
  prog("More Than a Feeling – Boston", "more-than-a-feeling", [
    ["D", "major"],
    ["C", "major"],
    ["G", "major"],
  ]),
  prog("Eye of the Tiger – Survivor", "eye-of-the-tiger", [
    ["C", "minor"],
    ["A#", "major"],
    ["G#", "major"],
    ["G", "major"],
  ]),
  prog("Jump – Van Halen", "jump", [
    ["C", "major"],
    ["F", "major"],
    ["G", "major"],
    ["C", "major"],
    ["F", "major"],
    ["A", "minor"],
  ]),
  prog("Pour Some Sugar on Me – Def Leppard", "pour-some-sugar", [
    ["B", "major"],
    ["E", "major"],
    ["A", "major"],
  ]),
  prog("Livin on a Prayer – Bon Jovi", "livin-on-a-prayer", [
    ["E", "minor"],
    ["C", "major"],
    ["D", "major"],
  ]),
  prog("Wanted Dead or Alive – Bon Jovi", "wanted-dead-or-alive", [
    ["D", "major"],
    ["A", "major"],
    ["G", "major"],
  ]),
  prog("Sultans of Swing – Dire Straits", "sultans-of-swing", [
    ["D", "minor"],
    ["C", "major"],
    ["A#", "major"],
    ["A", "major"],
  ]),

  // ─── Blues ───────────────────────────────────────────────────────────────

  prog("Sweet Home Chicago – Robert Johnson", "sweet-home-chicago", [
    ["E", "dominant"],
    ["A", "dominant"],
    ["B", "dominant"],
  ]),
  prog("The Thrill is Gone – BB King", "thrill-is-gone", [
    ["B", "minor"],
    ["E", "minor"],
    ["G", "major"],
    ["F#", "dominant"],
  ]),
  prog("Pride and Joy – SRV", "pride-and-joy", [
    ["E", "dominant"],
    ["A", "dominant"],
    ["B", "dominant"],
  ]),
  prog("Texas Flood – SRV", "texas-flood", [
    ["G", "dominant"],
    ["C", "dominant"],
    ["D", "dominant"],
  ]),
  prog("Crossroads – Cream", "crossroads", [
    ["A", "dominant"],
    ["D", "dominant"],
    ["E", "dominant"],
  ]),
  prog("Red House – Jimi Hendrix", "red-house", [
    ["B", "dominant"],
    ["E", "dominant"],
    ["F#", "dominant"],
  ]),
  prog("Stormy Monday – T-Bone Walker", "stormy-monday", [
    ["G", "dominant"],
    ["C", "dominant"],
    ["G", "dominant"],
    ["E", "dominant"],
    ["A", "minor"],
    ["D", "dominant"],
    ["G", "dominant"],
    ["D", "dominant"],
  ]),
  prog("Hoochie Coochie Man – Muddy Waters", "hoochie-coochie-man", [
    ["A", "dominant"],
    ["D", "dominant"],
    ["E", "dominant"],
  ]),
  prog("Born Under a Bad Sign – Albert King", "born-under-bad-sign", [
    ["C#", "dominant"],
    ["F#", "dominant"],
    ["G#", "dominant"],
  ]),
  prog("I Got My Mojo Working – Muddy Waters", "mojo-working", [
    ["F", "dominant"],
    ["A#", "dominant"],
    ["C", "dominant"],
  ]),

  // ─── Pop ─────────────────────────────────────────────────────────────────

  prog("Let It Be – Beatles", "let-it-be", [
    ["C", "major"],
    ["G", "major"],
    ["A", "minor"],
    ["F", "major"],
  ]),
  prog("Let It Be Verse – Beatles", "let-it-be-verse", [
    ["C", "major"],
    ["G", "major"],
    ["F", "major"],
    ["C", "major"],
  ]),
  prog("Hey Jude – Beatles", "hey-jude", [
    ["F", "major"],
    ["C", "major"],
    ["C", "dominant"],
    ["F", "major"],
  ]),
  prog("Blackbird – Beatles", "blackbird", [
    ["G", "major"],
    ["A", "minor"],
    ["G", "major"],
    ["F", "major"],
  ]),
  prog("No Woman No Cry – Bob Marley", "no-woman-no-cry", [
    ["C", "major"],
    ["G", "major"],
    ["A", "minor"],
    ["F", "major"],
  ]),
  prog("Redemption Song – Bob Marley", "redemption-song", [
    ["G", "major"],
    ["E", "minor"],
    ["C", "major"],
    ["D", "major"],
  ]),
  prog("Three Little Birds – Bob Marley", "three-little-birds", [
    ["A", "major"],
    ["D", "major"],
    ["E", "major"],
  ]),
  prog("Stand By Me – Ben E King", "stand-by-me", [
    ["A", "major"],
    ["F#", "minor"],
    ["D", "major"],
    ["E", "major"],
  ]),
  prog("Wonderful Tonight – Clapton", "wonderful-tonight", [
    ["G", "major"],
    ["D", "major"],
    ["C", "major"],
    ["D", "major"],
  ]),
  prog("Layla – Clapton Unplugged", "layla-unplugged", [
    ["C", "minor"],
    ["G", "major"],
    ["A#", "major"],
    ["C", "major"],
  ]),
  prog("Shape of You – Ed Sheeran", "shape-of-you", [
    ["C#", "minor"],
    ["F#", "minor"],
    ["A", "major"],
    ["B", "major"],
  ]),
  prog("Thinking Out Loud – Ed Sheeran", "thinking-out-loud", [
    ["D", "major"],
    ["G", "major"],
    ["A", "major"],
    ["B", "minor"],
  ]),
  prog("Someone Like You – Adele", "someone-like-you", [
    ["A", "major"],
    ["E", "major"],
    ["F#", "minor"],
    ["D", "major"],
  ]),
  prog("Rolling in the Deep – Adele", "rolling-in-the-deep", [
    ["C", "minor"],
    ["A#", "major"],
    ["G", "minor"],
  ]),
  prog("Hotel California – Eagles", "hotel-california", [
    ["B", "minor"],
    ["F#", "major"],
    ["A", "major"],
    ["E", "major"],
    ["G", "major"],
    ["D", "major"],
    ["E", "minor"],
    ["F#", "major"],
  ]),
  prog("Take It Easy – Eagles", "take-it-easy", [
    ["G", "major"],
    ["D", "major"],
    ["E", "minor"],
    ["C", "major"],
  ]),

  // ─── Country ─────────────────────────────────────────────────────────────

  prog("Ring of Fire – Johnny Cash", "ring-of-fire", [
    ["G", "major"],
    ["C", "major"],
    ["D", "major"],
  ]),
  prog("Folsom Prison Blues – Johnny Cash", "folsom-prison-blues", [
    ["G", "major"],
    ["C", "major"],
    ["D", "major"],
  ]),
  prog("Friends in Low Places – Garth Brooks", "friends-low-places", [
    ["A", "major"],
    ["B", "minor"],
    ["E", "major"],
  ]),
  prog("Take Me Home Country Roads – Denver", "country-roads", [
    ["G", "major"],
    ["E", "minor"],
    ["C", "major"],
    ["D", "major"],
  ]),
  prog("Jolene – Dolly Parton", "jolene", [
    ["A", "minor"],
    ["C", "major"],
    ["G", "major"],
    ["A", "minor"],
  ]),
  prog("Wagon Wheel – Old Crow Medicine Show", "wagon-wheel", [
    ["G", "major"],
    ["D", "major"],
    ["E", "minor"],
    ["C", "major"],
  ]),
  prog("Tennessee Whiskey – Chris Stapleton", "tennessee-whiskey", [
    ["A", "major"],
    ["B", "minor"],
    ["A", "major"],
  ]),
  prog("Mama Tried – Merle Haggard", "mama-tried", [
    ["G", "major"],
    ["C", "major"],
    ["D", "major"],
  ]),

  // ─── Soul & R&B ──────────────────────────────────────────────────────────

  prog("Superstition – Stevie Wonder", "superstition", [
    ["E", "minor"],
    ["A", "minor"],
    ["E", "minor"],
  ]),
  prog("Higher Ground – Stevie Wonder", "higher-ground", [
    ["E", "minor"],
    ["G", "major"],
    ["A", "minor"],
    ["C", "major"],
  ]),
  prog("Signed Sealed Delivered – Stevie Wonder", "signed-sealed", [
    ["F", "major"],
    ["A#", "major"],
    ["C", "dominant"],
    ["F", "major"],
  ]),
  prog("I Heard It Through the Grapevine – Marvin Gaye", "grapevine", [
    ["E", "minor"],
    ["A", "minor"],
    ["E", "minor"],
    ["B", "minor"],
  ]),
  prog("Respect – Aretha Franklin", "respect", [
    ["C", "major"],
    ["F", "major"],
    ["G", "major"],
  ]),
  prog("Mustang Sally – Wilson Pickett", "mustang-sally", [
    ["C", "dominant"],
    ["F", "dominant"],
    ["G", "dominant"],
  ]),
  prog("Green Onions – Booker T", "green-onions", [
    ["F", "dominant"],
    ["A#", "dominant"],
    ["C", "dominant"],
  ]),
  prog("Use Me – Bill Withers", "use-me", [
    ["G", "minor"],
    ["C", "dominant"],
    ["G", "minor"],
  ]),
  prog("Lean on Me – Bill Withers", "lean-on-me", [
    ["C", "major"],
    ["E", "minor"],
    ["F", "major"],
    ["G", "major"],
  ]),
  prog("Sittin on the Dock of the Bay – Otis Redding", "dock-of-the-bay", [
    ["G", "major"],
    ["B", "major"],
    ["C", "major"],
    ["A", "major"],
  ]),

  // ─── Classic Rock ────────────────────────────────────────────────────────

  prog("Sympathy for the Devil – Rolling Stones", "sympathy-for-devil", [
    ["E", "major"],
    ["A", "major"],
  ]),
  prog("Paint It Black – Rolling Stones", "paint-it-black", [
    ["E", "minor"],
    ["B", "major"],
    ["D", "major"],
    ["A", "major"],
  ]),
  prog("Wild Horses – Rolling Stones", "wild-horses", [
    ["G", "major"],
    ["A", "minor"],
    ["C", "major"],
    ["G", "major"],
  ]),
  prog("All Along the Watchtower – Hendrix", "all-along-watchtower", [
    ["C#", "minor"],
    ["B", "major"],
    ["A", "major"],
  ]),
  prog("Purple Haze – Jimi Hendrix", "purple-haze", [
    ["E", "dominant"],
    ["G", "major"],
    ["A", "major"],
  ]),
  prog("Light My Fire – The Doors", "light-my-fire", [
    ["A", "minor"],
    ["F#", "minor"],
    ["G", "major"],
    ["A", "major"],
  ]),
  prog("People Are Strange – The Doors", "people-are-strange", [
    ["E", "minor"],
    ["B", "major"],
    ["E", "minor"],
    ["A", "minor"],
  ]),
  prog("For What Its Worth – Buffalo Springfield", "for-what-its-worth", [
    ["E", "major"],
    ["A", "major"],
  ]),
  prog("Heart of Gold – Neil Young", "heart-of-gold", [
    ["E", "minor"],
    ["C", "major"],
    ["D", "major"],
    ["G", "major"],
  ]),
  prog("Old Man – Neil Young", "old-man", [
    ["D", "major"],
    ["A", "major"],
    ["G", "major"],
  ]),
  prog("Fire and Rain – James Taylor", "fire-and-rain", [
    ["G", "major"],
    ["A", "minor"],
    ["C", "major"],
    ["G", "major"],
  ]),
  prog("Mexico – James Taylor", "mexico", [
    ["E", "minor"],
    ["A", "minor"],
    ["D", "major"],
    ["G", "major"],
  ]),
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
