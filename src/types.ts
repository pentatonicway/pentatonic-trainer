export type ChordQuality = "major" | "minor" | "dominant";

export type NoteRoot =
  | "A" | "A#" | "Bb" | "B" | "C" | "C#" | "Db"
  | "D" | "D#" | "Eb" | "E" | "F" | "F#" | "Gb"
  | "G" | "G#" | "Ab";

export type ScaleDegree = "1" | "2" | "b3" | "3" | "4" | "b5" | "5" | "b6" | "6" | "b7" | "7";

export type StringFretDot = {
  fret: number;        // absolute fret number (0 = open)
  degree: ScaleDegree;
};

export type GuitarString = {
  stringNumber: number; // 1 = high e, 6 = low E
  dots: StringFretDot[];
};

export type ShapeData = {
  id: string;
  label: string;
  baseFret: number;       // lowest fret in the shape
  strings: GuitarString[];
};

export type BoxData = {
  id: string;
  chordRoot: NoteRoot;
  chordQuality: ChordQuality;
  shapeIndex: number;
  transposeOffset: number;
  locked: boolean;
  scaleDegreeVisibility: Record<ScaleDegree, boolean>;
};

export type Progression = {
  id: string;
  name: string;
  boxes: BoxData[];
  thumbnail?: string;
};

export type OverrideRule = {
  key: string; // format: "<quality>|<baseShapeIndex>|<intervalFromBox1>"
  shapeIndex: number;
};
