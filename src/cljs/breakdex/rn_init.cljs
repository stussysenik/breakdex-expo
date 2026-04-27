(ns breakdex.rn-init
  (:require [reagent.core :as r]
            [breakdex.design.tokens :as tokens]
            [breakdex.screens :as screens]
            [breakdex.state.store :as store]
            [breakdex.uix :as uix]))

(defn- nav-button [theme {:keys [key label]} active-screen]
  (let [active? (= key active-screen)]
    [uix/touchable
     {:on-press #(store/dispatch! {:type :nav/set-screen :screen key})
      :style {:flex 1
              :align-items "center"
              :justify-content "center"
              :padding-vertical (tokens/get-spacing :sm)}}
     [uix/view {:style {:align-items "center"}}
      [uix/view
       {:style {:width 28
                :height 4
                :border-radius (tokens/get-radius :xl)
                :margin-bottom 8
                :background-color (if active?
                                    (tokens/get-color theme :accent)
                                    (tokens/get-color theme :separator))}}]
      [uix/text
       {:style {:color (if active?
                          (tokens/get-color theme :accent)
                          (tokens/get-color theme :secondary))
                :font-size (tokens/get-type-size :caption)
                :font-family (tokens/get-font :sansSemiBold)}}
       label]]]))

(defn- app-shell []
  (let [state @store/app-state
        theme (store/theme-mode state)
        active-screen (store/active-screen state)]
    (uix/set-theme! theme)
    [uix/safe-area-view
     {:style {:flex 1
              :background-color (tokens/get-color theme :background)}}
     [uix/view {:style {:flex 1}}
      [screens/render-screen active-screen state theme]]
     [uix/view
      {:style {:background-color (tokens/get-color theme :surface)
               :border-top-width 1
               :border-top-color (tokens/get-color theme :separator)
               :flex-direction "row"
               :padding-horizontal (tokens/get-spacing :sm)
               :padding-bottom (tokens/get-spacing :sm)
               :padding-top (tokens/get-spacing :sm)}}
      (for [tab (:nav/tabs state)]
        ^{:key (:key tab)}
        [nav-button theme tab active-screen])]]))

(defn init []
  (store/init-app!)
  nil)

(def app-root (r/reactify-component app-shell))

(set! (.-exports js/module) #js {"default" app-root})
