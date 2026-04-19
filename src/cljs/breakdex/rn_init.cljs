(ns breakdex.rn-init
  (:require ["react" :as react]
            ["react-native" :as rn]
            [reagent.core :as reagent]
            [breakdex.design.tokens :as tokens]
            [breakdex.dsl.components :as dsl]
            [breakdex.state.store :as store]
            [breakdex.screens :as screens]))

(defonce root-component
  (reagent/create-class
    {:display-name "breakdex-app"
     :get-initial-state (fn [] @store/app-state)
     :component-did-mount store/init-app!)
     :reagent-render
     (fn []
       (let [theme (:theme/name @store/app-state)
             screen (:ui/active-screen @store/app-state)]
         (dsl/view
          {:style {:flex 1
                   :background-color (tokens/get-color theme :background)}}
          (screens/render-screen screen theme))))}))

(defn ^:export init
  "Expo entry point - returns React component"
  []
  root-component)

(defn ^:export register-root!
  "Called by Expo to register the root"
  [root-view]
  (println "Breakdex initialized!"))