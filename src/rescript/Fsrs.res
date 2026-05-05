// Breakdex FSRS Kernel — ReScript
// Pure functional implementation of the Free Spaced Repetition Scheduler

type rating =
  | Again
  | Hard
  | Good
  | Easy

type card = {
  interval: int,
  easeFactor: float,
  repetitions: int,
  lapses: int,
  state: int,
}

type reviewResult = {
  interval: int,
  easeFactor: float,
  repetitions: int,
  lapses: int,
  state: int,
  dueMs: float,
}

let dayMs = 24.0 *. 60.0 *. 60.0 *. 1000.0

let clampEase = (e: float) => Js.Math.max_float(1.3, e)

let nextIntervalForHard = (state: int, interval: int, ease: float): int =>
  switch state {
  | 0 => 1
  | 1 => Js.Math.max_int(1, Js.Math.round(float_of_int(interval) *. 1.2) |> int_of_float)
  | _ => Js.Math.max_int(1, Js.Math.round(float_of_int(interval) *. ease *. 1.2) |> int_of_float)
  }

let nextIntervalForGood = (state: int, interval: int, ease: float): int =>
  switch state {
  | 0 => 1
  | 1 => Js.Math.max_int(1, Js.Math.round(float_of_int(interval) *. 1.5) |> int_of_float)
  | _ => Js.Math.max_int(1, Js.Math.round(float_of_int(interval) *. ease) |> int_of_float)
  }

let nextIntervalForEasy = (state: int, interval: int, ease: float): int =>
  switch state {
  | 0 => 4
  | 1 => 4
  | _ =>
    Js.Math.max_int(
      1,
      Js.Math.round(float_of_int(interval) *. (ease +. 0.15) *. 1.3) |> int_of_float,
    )
  }

let deriveNextState = (interval: int, repetitions: int, rating: rating): int =>
  switch rating {
  | Again => 3
  | Hard => interval == 0 ? 0 : 1
  | Good =>
    if interval >= 21 && repetitions > 2 {
      2
    } else {
      1
    }
  | Easy => 2
  }

let calculateNextReview = (card: card, rating: rating): reviewResult => {
  let {interval, easeFactor, repetitions, lapses, state} = card
  let nowMs = Js.Date.now()

  let (newInterval, newEase, newReps, newLapses) = switch rating {
  | Again => (1, clampEase(easeFactor -. 0.2), repetitions, lapses + 1)
  | Hard => (
      nextIntervalForHard(state, interval, easeFactor),
      clampEase(easeFactor -. 0.15),
      repetitions,
      lapses,
    )
  | Good => (
      nextIntervalForGood(state, interval, easeFactor),
      easeFactor,
      repetitions + 1,
      lapses,
    )
  | Easy => (
      nextIntervalForEasy(state, interval, easeFactor),
      easeFactor +. 0.15,
      repetitions + 1,
      lapses,
    )
  }

  let newState = deriveNextState(newInterval, newReps, rating)
  let dueMs = nowMs +. float_of_int(newInterval) *. dayMs

  {interval: newInterval, easeFactor: newEase, repetitions: newReps, lapses: newLapses, state: newState, dueMs}
}

// Due summary computation
type dueSummary = {
  newDue: int,
  learningDue: int,
  reviewDue: int,
  totalDueToday: int,
  dueTomorrow: int,
}

let isDueToday = (dueMsVal: float): bool => {
  let now = Js.Date.now()
  let todayEnd = {
    let d = Js.Date.make()
    let _ = Js.Date.setHoursMs(d, ~hours=23.0, ~minutes=59.0, ~seconds=59.0, ~milliseconds=999.0)
    Js.Date.getTime(d)
  }
  dueMsVal <= todayEnd && dueMsVal <= now +. dayMs
}

// Exported JS-friendly functions
@gentype
let ratingFromString = (s: string): rating =>
  switch s {
  | "again" => Again
  | "hard" => Hard
  | "easy" => Easy
  | _ => Good
  }
