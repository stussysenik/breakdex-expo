;; Breakdex Screens - Pure EDN Definitions
;; =======================================

(ns breakdex.screens
  "Screen definitions as pure EDN data"
  (:require [breakdex.design.tokens :as tokens]
            [breakdex.dsl.components :as dsl]
            [breakdex.state.store :as store]))

;; ═══════════════════════════════════════════════════════════
;; SCREEN REGISTRY
;; ═══════════════════════════════════════════════════════════

(def screens
  {:moves
   {:title "Arsenal"
    :icon "dumbbell"
    :route "/moves"}
   
   :review
   {:title "Drill"
    :icon "target"
    :route "/drill"}
   
   :stats
   {:title "Progress"
    :icon "chart"
    :route "/stats"}
   
   :lab
   {:title "Lab"
    :icon "flask"
    :route "/lab"}
   
   :flow
   {:title "Flow"
    :icon "git-branch"
    :route "/flow"}
   
   :settings
   {:title "Settings"
    :icon "settings"
    :route "/settings"}})

;; ═══════════════════════════════════════════════════════════
;; NAVIGATION
;; ═══════════════════════════════════════════════════════════

(def navigation
  {:type :tab-bar
   :tabs
   [{:key :moves :title "Moves" :icon "dumbbell" :route "/moves"}
    {:key :review :title "Drill" :icon "target" :route "/drill"}
    {:key :stats :title "Progress" :icon "chart" :route "/stats"}
    {:key :lab :title "Lab" :icon "flask" :route "/lab"}
    {:key :flow :title "Flow" :icon "git-branch" :route "/flow"}]})

;; ═══════════════════════════════════════════════════════════
;; RENDERERS
;; ═══════════════════════════════════════════════════════════

(def screen-renderers
  {:moves (fn [theme]
           (dsl/view
            {:style {:flex 1 :backgroundColor (tokens/get-color theme :background)}}
            (dsl/view
             {:style {:padding (tokens/get-spacing :md) :paddingTop (tokens/get-spacing :lg)}}
             (dsl/text
              {:style {:fontSize (tokens/get-type-size :title-medium)
                       :fontWeight "600"
                       :color (tokens/get-color theme :text)}}
              "Arsenal"))
            (dsl/view
             {:style {:flex 1 :justifyContent "center" :alignItems "center"}}
             (dsl/text
              {:style {:color (tokens/get-color theme :secondary)}}
              "Your moves will appear here"))))
   
   :review (fn [theme]
            (dsl/view
             {:style {:flex 1 :backgroundColor (tokens/get-color theme :background)}}
             (dsl/text
              {:style {:fontSize (tokens/get-type-size :title-medium)
                       :fontWeight "600"
                       :color (tokens/get-color theme :text)
                       :padding (tokens/get-spacing :md)
                       :paddingTop (tokens/get-spacing :lg)}}
              "Drill")))
   
   :stats (fn [theme]
           (dsl/view
            {:style {:flex 1 :backgroundColor (tokens/get-color theme :background)}}
            (dsl/text
             {:style {:fontSize (tokens/get-type-size :title-medium)
                      :fontWeight "600"
                      :color (tokens/get-color theme :text)
                      :padding (tokens/get-spacing :md)
                      :paddingTop (tokens/get-spacing :lg)}}
             "Progress")))
   
   :lab (fn [theme]
         (dsl/view
          {:style {:flex 1 :backgroundColor (tokens/get-color theme :background)}}
          (dsl/text
           {:style {:fontSize (tokens/get-type-size :title-medium)
                    :fontWeight "600"
                    :color (tokens/get-color theme :text)
                    :padding (tokens/get-spacing :md)
                    :paddingTop (tokens/get-spacing :lg)}}
           "Lab")))
   
   :flow (fn [theme]
          (dsl/view
           {:style {:flex 1 :backgroundColor (tokens/get-color theme :background)}}
           (dsl/text
            {:style {:fontSize (tokens/get-type-size :title-medium)
                     :fontWeight "600"
                     :color (tokens/get-color theme :text)
                     :padding (tokens/get-spacing :md)
                     :paddingTop (tokens/get-spacing :lg)}}
            "Flow")))
   
   :settings (fn [theme]
                      (dsl/view
                       {:style {:flex 1 :backgroundColor (tokens/get-color theme :background)}}
                       (dsl/text
                        {:style {:fontSize (tokens/get-type-size :title-medium)
                                 :fontWeight "600"
                                 :color (tokens/get-color theme :text)
                                 :padding (tokens/get-spacing :md)
                                 :paddingTop (tokens/get-spacing :lg)}}
                        "Settings")))})

;; ═══════════════════════════════════════════════════════════
;; ENTRY
;; ═══════════════════════════════════════════════════════════

(defn render-screen
  [screen-key theme]
  (let [renderer (get screen-renderers screen-key)]
    (if renderer
      (renderer theme)
      ((get screen-renderers :moves theme)))))

;; JS exports
(goog/exportSymbol "BreakdexScreens" #js {:render-screen render-screen
                                         :screens screens
                                         :navigation navigation})