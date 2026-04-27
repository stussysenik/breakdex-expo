(ns breakdex.platform.stack)

(def backend-stack
  [{:id :frontend
    :title "Frontend shell"
    :value "Expo + ClojureScript"
    :detail "Native runtime, Carbon tokens, NativeWind utilities, Reagent rendering."}
   {:id :network
    :title "Network adapter"
    :value "Phoenix"
    :detail "Transport boundary only. The UI dispatches intents and consumes shaped responses."}
   {:id :logic
    :title "Logic engine"
    :value "Gleam"
    :detail "Scheduling, scoring, and algorithmic rules stay outside the rendering tree."}
   {:id :sync
    :title "Sync default"
    :value "ElectricSQL"
    :detail "Offline-first sync with explicit local/cloud asset states surfaced in the UI."}
   {:id :query
    :title "Query builder"
    :value "Squirrel"
    :detail "Database write/query composition is pushed behind adapters, not called from screens."}])

(def sync-principles
  ["UI renders derived state only."
   "Asset rows always expose local/cloud residence."
   "Sync health is visible before user actions fail."
   "Tokens originate in Token Studio JSON and fan out to TS, CLJS, and CSS variables."])
