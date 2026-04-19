;; Breakdex State - FRP + DOP Style
;; =================================

(ns breakdex.state.store
  "FRP-style state management with EDN data")

;; ═══════════════════════════════════════════════════════════
;; CORE STATE
;; ═══════════════════════════════════════════════════════════

(def initial-state
  {:app/initialized? false
   
   :theme/name :light
   :theme/accent "#1F5EFF"
   
   :moves/collection []
   :moves/selected-id nil
   :moves/filter {}
   :moves/search ""
   
   :review/decks []
   :review/due-cards []
   
   :stats/data {}
   
   :settings/font-family "Inter"})

;; ═══════════════════════════════════════════════════════════════════
;; LENS HELPERS
;; ═══════════════════════════════════════════════════════════════════

(def get-in* clojure.core/get-in)
(def update-in* clojure.core/update-in)
(def assoc-in* clojure.core/assoc-in)

;; ═══════════════════════════════════════════════════════════
;; REDUCERS
;; ═══════════════════════════════════════════════════════════

(def reducers
  {:app/initialize
   (fn [state event]
     (assoc state :app/initialized? true))
   
   :theme/set
   (fn [state event]
     (assoc state :theme/name (:theme event)))
   
   :moves/add
   (fn [state event]
     (let [new-move {:id (str (random-uuid))
                   :name (:name (:payload event))
                   :created-at (str (js/Date.))
                   :learning-state :new}]
       (update state :moves/collection conj new-move)))
   
   :moves/delete
   (fn [state event]
     (update state :moves/collection
            (fn [coll] (vec (remove #( (= (:id %) (:id event)) coll)))))
   
   :moves/select
   (fn [state event]
     (assoc state :moves/selected-id (:id event)))
   
   :moves/filter
   (fn [state event]
     (assoc state :moves/filter (:filter event)))
   
   :moves/search
   (fn [state event]
     (assoc state :moves/search (:query event)))})

;; ═══════════════════════════════════════════════════════════
;; DERIVED STATE
;; ═══════════════════════════════════════════════════════════

(def derived
  {:moves/filtered
   (fn [state]
     (let [filter (:moves/filter state)
           search (:moves/search state)
           moves (:moves/collection state)]
       moves))
   
   :moves/count
   (fn [state]
     (count (:moves/collection state)))
   
   :moves/by-state
   (fn [state learning-state]
     (filter #( = (:learning-state %) learning-state) (:moves/collection state)))
   
   :review/due-count
   (fn [state]
     (count (:review/due-cards state)))) 

;; ═══════════════════════════════════════════════════════════
;; STATE MACHINE
;; ══���════════════════════════════════════════════════════════

(def state-atom (atom initial-state))

(defn dispatch!
  [event]
  (let [event-type (:type event)
        reducer (get reducers event-type)]
    (when reducer
      (swap! state-atom reducer event))))

(defn subscribe
  [path f]
  (add-watch state-atom path
             (fn [_ _ old new]
               (let [old-val (get-in* old path)
                     new-val (get-in* new path)]
                 (when (not= old-val new-val)
                   (f new-val))))))

;; ═══════════════════════════════════════════════════════════
;; QUERIES
;; ═══════════════════════════════════════════════════════════

(defn query
  [key]
  (let [derived-fn (get derived key)]
    (when derived-fn
      (derived-fn @state-atom))))

(defn get-state
  ([] @state-atom)
  ([path] (get-in* @state-atom path)))

;; ═══════════════════════════════════════════════════════════
;; INITIALIZATION
;; ═══════════════════════════════════════════════════════════

(def app-state state-atom)

(defn init-app!
  []
  (dispatch! {:type :app/initialize}))

;; JS exports
(goog/exportSymbol "BreakdexStore" #js {:dispatch dispatch!
                                         :subscribe subscribe
                                         :query query
                                         :getState get-state
                                         :init init-app!})