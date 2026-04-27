(ns breakdex.state.store
  (:require [clojure.string :as str]
            [breakdex.state.sample-data :as sample]))

(def initial-state
  {:app/initialized? false
   :theme/mode :light
   :nav/active-screen :arsenal
   :nav/tabs sample/nav-tabs
   :moves/search ""
   :moves/collection sample/moves
   :flow/links sample/flow-links
   :assets/library sample/assets
   :review/session {:cards-reviewed 6
                    :again 1
                    :hard 1
                    :good 3
                    :easy 1}
   :settings/backend {:network :phoenix
                      :logic :gleam
                      :sync :electric-sql
                      :query :squirrel}})

(defonce app-state (atom initial-state))

(def sync-cycle
  {:local-only :syncing
   :syncing :in-sync
   :in-sync :needs-review
   :needs-review :local-only
   :cloud-only :syncing})

(defn- move-state->rating [rating]
  (case rating
    :again :learning
    :hard :learning
    :good :review
    :easy :mastery
    :new))

(defn- normalize [value]
  (-> value str str/lower-case str/trim))

(defn- includes-query? [query move]
  (let [needle (normalize query)
        haystack (normalize (str (:move/name move) " " (:move/category move) " " (:move/notes move)))]
    (or (str/blank? needle) (str/includes? haystack needle))))

(defn active-screen
  ([]
   (active-screen @app-state))
  ([state]
   (:nav/active-screen state)))

(defn theme-mode
  ([]
   (theme-mode @app-state))
  ([state]
   (:theme/mode state)))

(defn filtered-moves
  ([]
   (filtered-moves @app-state))
  ([state]
   (filter #(includes-query? (:moves/search state) %) (:moves/collection state))))

(defn due-cards
  ([]
   (due-cards @app-state))
  ([state]
   (filter :move/review-due? (:moves/collection state))))

(defn review-accuracy
  ([]
   (review-accuracy @app-state))
  ([state]
   (let [{:keys [again hard good easy]} (:review/session state)
         total (+ again hard good easy)]
     (if (zero? total)
       0
       (js/Math.round (* 100 (/ (+ good easy) total)))))))

(defn asset-counts
  ([]
   (asset-counts @app-state))
  ([state]
   (reduce
    (fn [acc asset]
      (-> acc
          (update :total inc)
          (update (:asset/storage-scope asset) (fnil inc 0))
          (update (:asset/sync-status asset) (fnil inc 0))))
    {:total 0 :local 0 :cloud 0 :in-sync 0 :syncing 0 :local-only 0 :cloud-only 0 :needs-review 0}
    (:assets/library state))))

(defn move-count
  ([]
   (move-count @app-state))
  ([state]
   (count (:moves/collection state))))

(defn flow-count
  ([]
   (flow-count @app-state))
  ([state]
   (count (:flow/links state))))

(defn current-card
  ([]
   (current-card @app-state))
  ([state]
   (first (due-cards state))))

(defn asset-by-id [state asset-id]
  (first (filter #(= (:asset/id %) asset-id) (:assets/library state))))

(defn move-by-id [state move-id]
  (first (filter #(= (:move/id %) move-id) (:moves/collection state))))

(def reducers
  {:app/init
   (fn [state _]
     (assoc state :app/initialized? true))

   :nav/set-screen
   (fn [state {:keys [screen]}]
     (assoc state :nav/active-screen screen))

   :theme/toggle
   (fn [state _]
     (update state :theme/mode #(if (= % :light) :dark :light)))

   :moves/search
   (fn [state {:keys [value]}]
     (assoc state :moves/search value))

   :moves/add-sample
   (fn [state _]
     (update state :moves/collection conj
             {:move/id (str "move-" (.now js/Date))
              :move/name "Fresh combo draft"
              :move/category "Transitions"
              :move/learning-state :new
              :move/notes "New idea captured from practice. Needs filming."
              :move/review-due? true
              :move/asset-id nil}))

   :review/rate
   (fn [state {:keys [rating]}]
     (if-let [card (current-card state)]
       (let [move-id (:move/id card)]
         (-> state
             (update-in [:review/session :cards-reviewed] inc)
             (update-in [:review/session rating] (fnil inc 0))
             (update :moves/collection
                     (fn [moves]
                       (mapv
                        (fn [move]
                          (if (= (:move/id move) move-id)
                            (assoc move
                                   :move/review-due? false
                                   :move/learning-state (move-state->rating rating))
                            move))
                        moves)))))
       state))

   :assets/cycle-sync
   (fn [state {:keys [asset-id]}]
     (update state :assets/library
             (fn [assets]
               (mapv
                (fn [asset]
                  (if (= (:asset/id asset) asset-id)
                    (update asset :asset/sync-status #(get sync-cycle % %))
                    asset))
                assets))))})

(defn dispatch! [event]
  (when-let [reducer (get reducers (:type event))]
    (swap! app-state reducer event)))

(defn init-app! []
  (dispatch! {:type :app/init}))
