(ns breakdex.screens
  (:require [breakdex.design.tokens :as tokens]
            [breakdex.platform.stack :as stack]
            [breakdex.platform.storage :as storage]
            [breakdex.state.store :as store]
            [breakdex.ui.carbon :as carbon]
            [breakdex.uix :as uix]))

(defn- metric-grid [theme items]
  [uix/view {:style {:flex-direction "row"
                     :flex-wrap "wrap"
                     :gap 12
                     :margin-bottom 16}}
   (for [{:keys [label value tone]} items]
     ^{:key label}
     [carbon/metric-tile {:theme theme :label label :value value :tone tone}])])

(defn- move-tone [move]
  (case (:move/learning-state move)
    :new :accent
    :learning :learning
    :review :review
    :mastery :mastery
    :default))

(defn- move-tag [theme move]
  [carbon/inline-tag
   {:theme theme
    :label (-> move :move/learning-state name)
    :tone (move-tone move)}])

(defn arsenal-screen [state theme]
  (let [moves (store/filtered-moves state)
        assets (store/asset-counts state)]
    [carbon/screen-shell theme
     [carbon/page-header
      {:theme theme
       :eyebrow "Carbon runtime"
       :title "Breakdex Arsenal"
       :subtitle "ClojureScript drives the Expo shell with one token source and explicit sync metadata."
       :action [carbon/app-button {:theme theme
                                   :label "Add sample move"
                                   :on-press #(store/dispatch! {:type :moves/add-sample})}]}]
     [metric-grid theme
      [{:label "Moves" :value (store/move-count state) :tone :accent}
       {:label "Due now" :value (count (store/due-cards state)) :tone :review}
       {:label "Assets" :value (:total assets) :tone :learning}]]
     [carbon/tile {:theme theme}
      [carbon/text-field
       {:theme theme
        :label "Search library"
        :value (:moves/search state)
        :placeholder "Search moves, categories, or notes"
        :helper "NativeWind handles layout utilities while colors and sizing stay token-driven."
        :on-change-text #(store/dispatch! {:type :moves/search :value %})}]]
     (if (seq moves)
       [uix/view {}
        (for [move moves]
          ^{:key (:move/id move)}
          [carbon/detail-row
           {:theme theme
            :title (:move/name move)
            :subtitle (str (:move/category move) " • " (:move/notes move))
            :trailing [move-tag theme move]}])]
       [carbon/empty-state
        {:theme theme
         :title "No moves match this query"
         :body "Clear the filter or add another move draft to keep the review queue moving."}])]))

(def review-buttons
  [{:rating :again :label "Again" :kind :danger}
   {:rating :hard :label "Hard" :kind :secondary}
   {:rating :good :label "Good" :kind :primary}
   {:rating :easy :label "Easy" :kind :ghost}])

(defn review-screen [state theme]
  (let [card (store/current-card state)
        session (:review/session state)]
    [carbon/screen-shell theme
     [carbon/page-header
      {:theme theme
       :eyebrow "Spaced review"
       :title "Keep the round warm"
       :subtitle "Ratings mutate only review state. Rendering stays dumb and derived."}]
     [metric-grid theme
      [{:label "Due now" :value (count (store/due-cards state)) :tone :review}
       {:label "Accuracy" :value (str (store/review-accuracy state) "%") :tone :mastery}
       {:label "Reviewed" :value (:cards-reviewed session) :tone :accent}]]
     (if card
       [carbon/tile {:theme theme :class-name "gap-3"}
        [carbon/section-label {:theme theme :label "Current card"}]
        [uix/text {:style {:color (tokens/get-color theme :text)
                           :font-size (tokens/get-type-size :title-medium)
                           :line-height (tokens/get-line-height :title-medium)
                           :font-family (tokens/get-font :sansBold)}}
         (:move/name card)]
        [uix/text {:style {:color (tokens/get-color theme :secondary)
                           :font-size (tokens/get-type-size :body-small)
                           :line-height (tokens/get-line-height :body-small)
                           :font-family (tokens/get-font :sansRegular)}}
         (:move/notes card)]
        [uix/view {:style {:flex-direction "row"
                           :flex-wrap "wrap"
                           :gap 8}}
         [carbon/inline-tag {:theme theme :label (:move/category card) :tone :default}]
         [move-tag theme card]]
        [uix/view {:style {:gap 8
                           :margin-top (tokens/get-spacing :sm)}}
         (for [{:keys [rating label kind]} review-buttons]
           ^{:key label}
           [carbon/app-button {:theme theme
                               :kind kind
                               :label label
                               :on-press #(store/dispatch! {:type :review/rate :rating rating})}])]]
       [carbon/empty-state
        {:theme theme
         :title "Queue is clear"
         :body "The current session has no more due cards. Add material or wait for the next review window."}])]))

(defn library-screen [state theme]
  (let [assets (:assets/library state)
        counts (store/asset-counts state)]
    [carbon/screen-shell theme
     [carbon/page-header
      {:theme theme
       :eyebrow "Library state"
       :title "Local and cloud assets"
       :subtitle "Every asset exposes storage residency and sync health before you touch it."}]
     [metric-grid theme
      [{:label "Local" :value (:local counts) :tone :accent}
       {:label "Cloud" :value (:cloud counts) :tone :learning}
       {:label "Pending" :value (+ (:syncing counts) (:needs-review counts) (:local-only counts) (:cloud-only counts)) :tone :review}]]
     (for [asset assets]
       ^{:key (:asset/id asset)}
       [carbon/detail-row
        {:theme theme
         :title (:asset/name asset)
         :subtitle (str (storage/storage-label (:asset/storage-scope asset))
                        " • "
                        (storage/asset-detail asset))
         :on-press #(store/dispatch! {:type :assets/cycle-sync :asset-id (:asset/id asset)})
         :trailing [uix/view {:style {:gap 6 :align-items "flex-end"}}
                    [carbon/inline-tag
                     {:theme theme
                      :label (storage/sync-label (:asset/sync-status asset))
                      :tone (storage/sync-tone (:asset/sync-status asset))}]
                    [uix/text {:style {:color (tokens/get-color theme :secondary)
                                       :font-size (tokens/get-type-size :caption)
                                       :font-family (tokens/get-font :sansRegular)}}
                     "Tap to cycle"]]}])]))

(defn sync-screen [state theme]
  [carbon/screen-shell theme
   [carbon/page-header
    {:theme theme
     :eyebrow "System contracts"
     :title "Decoupled stack"
     :subtitle "Frontend rendering is isolated from Phoenix, Gleam, ElectricSQL, and Squirrel through explicit adapter boundaries."}]
   [metric-grid theme
    [{:label "Flows" :value (store/flow-count state) :tone :accent}
     {:label "In sync" :value (:in-sync (store/asset-counts state)) :tone :mastery}
     {:label "Flags" :value (count stack/sync-principles) :tone :learning}]]
   [carbon/tile {:theme theme}
    [carbon/section-label {:theme theme :label "Operational rules"}]
    (for [principle stack/sync-principles]
      ^{:key principle}
      [uix/text {:style {:color (tokens/get-color theme :secondary)
                         :font-size (tokens/get-type-size :body-small)
                         :line-height (tokens/get-line-height :body-small)
                         :font-family (tokens/get-font :sansRegular)
                         :margin-bottom 8}}
       principle])]
   (for [{:keys [id title value detail]} stack/backend-stack]
     ^{:key id}
     [carbon/detail-row
      {:theme theme
       :title title
       :subtitle detail
       :trailing [carbon/inline-tag {:theme theme :label value :tone :default}]}])])

(defn settings-screen [state theme]
  [carbon/screen-shell theme
   [carbon/page-header
    {:theme theme
     :eyebrow "Runtime controls"
     :title "Settings"
     :subtitle "Token Studio JSON is the source of truth for TS, CLJS, CSS variables, and Storybook/web previews."}]
   [carbon/detail-row
    {:theme theme
     :title "Theme mode"
     :subtitle (str "Current mode: " (name (store/theme-mode state)))
     :on-press #(store/dispatch! {:type :theme/toggle})
     :trailing [carbon/inline-tag {:theme theme
                                   :label (name (store/theme-mode state))
                                   :tone :accent}]}]
   [carbon/detail-row
    {:theme theme
     :title "Token source"
     :subtitle "src/theme/tokens.json -> TS tokens, CLJS tokens, and carbon.css variables."
     :trailing [carbon/inline-tag {:theme theme :label "In sync" :tone :mastery}]}]
   [carbon/detail-row
    {:theme theme
     :title "Backend contract"
     :subtitle (str "Networking: " (name (get-in state [:settings/backend :network]))
                    " • Logic: " (name (get-in state [:settings/backend :logic]))
                    " • Sync: " (name (get-in state [:settings/backend :sync])))
     :trailing [carbon/inline-tag
                {:theme theme
                 :label "Adapters"
                 :tone :review}]}]])

(def screen-renderers
  {:arsenal arsenal-screen
   :review review-screen
   :library library-screen
   :sync sync-screen
   :settings settings-screen})

(defn render-screen [screen state theme]
  (if-let [screen-renderer (get screen-renderers screen)]
    [screen-renderer state theme]
    [carbon/empty-state
     {:theme theme
      :title "Missing screen"
      :body (str "No renderer is registered for " (name screen) ".")}]))
