// Breakdex Learning State Kernel — ReScript
// Pure state transition logic for move learning states

type learningState =
  | New
  | Learning
  | Mastery

type rating =
  | Again
  | Hard
  | Good
  | Easy

let learningStateFromString = (s: string): learningState =>
  switch s {
  | "LEARNING" => Learning
  | "MASTERY" => Mastery
  | _ => New
  }

let learningStateToString = (state: learningState): string =>
  switch state {
  | New => "NEW"
  | Learning => "LEARNING"
  | Mastery => "MASTERY"
  }

let applyRating = (state: learningState, rating: rating): learningState =>
  switch rating {
  | Again => New
  | Hard => Learning
  | Good =>
    switch state {
    | New => Learning
    | Learning => Mastery
    | Mastery => Mastery
    }
  | Easy => Mastery
  }

let ratingFromString = (s: string): rating =>
  switch s {
  | "again" => Again
  | "hard" => Hard
  | "easy" => Easy
  | _ => Good
  }

let stateColor = (state: learningState): string =>
  switch state {
  | New => "#E45D7A"
  | Learning => "#2F6BFF"
  | Mastery => "#1F8A70"
  }

let stateLabel = (state: learningState): string =>
  switch state {
  | New => "NEW"
  | Learning => "LEARNING"
  | Mastery => "MASTERY"
  }

let masteryPercent = (total: int, mastered: int): float =>
  if total == 0 {
    0.0
  } else {
    float_of_int(mastered) /. float_of_int(total) *. 100.0
  }
