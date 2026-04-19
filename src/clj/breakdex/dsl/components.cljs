;; Breakdex DSL - Hiccup-Style Component Builder
;; ============================================
;; Pure data in → React elements out
;; Following Hiccup conventions: [:tagname {:attrs} children]

(ns breakdex.dsl.components
  "Hiccup-style DSL for React Native components"
  (:require [breakdex.design.tokens :as tokens]))

;; ═══════════════════════════════════════════════════════════
;; CORE HICCUP INTERPRETER
;; ═══════════════════════════════════════════════════════════

(def ^:dynamic *theme* :light)

(defn resolve-theme [theme-name]
  (or theme-name *theme* :light))

;; Base component factory - converts EDN to React elements
;; Pattern: [:type props & children]
;; Example: [:view {:style {:padding 16}} "hello"]
(defn element
  "Create a React element from hiccup-like data"
  [type props & children]
  #js {:type type
       :props (clj->js (or props {}))
       :children (if (sequential? children)
                   (into-array children)
                   children)})

;; ═══════════════════════════════════════════════════════════
;; SHORTCUT CONSTRUCTORS
;; ═══════════════════════════════════════════════════════════

(defn view
  "View component with style resolution"
  [props & children]
  (apply element "View" props children))

(defn text
  "Text component"
  [props & children]
  (apply element "Text" props children))

(defn scroll-view
  "ScrollView"
  [props & children]
  (apply element "ScrollView" props children))

(defn touchable-opacity
  "TouchableOpacity pressable"
  [props & children]
  (apply element "TouchableOpacity" props children))

(defn text-input
  "TextInput"
  [props]
  (element "TextInput" props))

(defn image
  "Image"
  [props]
  (element "Image" props))

(defn flat-list
  "FlatList"
  [props]
  (element "FlatList" props))

;; ═══════════════════════════════════════════════════════════
;; STYLE BUILDERS - Functions that return style maps
;; ═══════════════════════════════════════════════════════════

(defn style-map
  "Build style map from token references"
  [theme & refs]
  (reduce merge {}
    (map (fn [ref]
           (cond
             (keyword? ref)
               (case (namespace ref)
                 "color"    {:color (tokens/get-color theme (name ref))}
                 "spacing"  {:padding (tokens/get-spacing (name ref))}
                 "radius"   {:borderRadius (tokens/get-radius (name ref))}
                 "type"     {:fontSize (tokens/get-type-size (name ref))}
                 {})
             (map? ref) ref
             :else {}))
         refs)))

(defn panel
  "Create panel style"
  [theme & {:keys [tone raised focused]}]
  (let [base {:backgroundColor (tokens/get-color theme :surface)
              :borderRadius (tokens/get-radius :md)
              :padding (tokens/get-spacing :md)}
        shadow (cond
                 focused (tokens/shadows :focus)
                 raised  (tokens/shadows :raised)
                 :else   (tokens/shadows :soft))]
    (merge base {:shadowColor "#000"
                 :shadowOpacity (get-in (tokens/shadows :soft) [:opacity] 0.08)
                 :shadowOffset #js {:x 0 :y 4}
                 :shadowRadius 12})))

;; ═══════════════════════════════════════════════════════════
;; PRECOMPOSED COMPONENTS - Higher-level DSL
;; ═══════════════════════════════════════════════════════════

(defn card
  "Card component - data in, element out"
  [{:keys [theme elevated on-press children]}]
  (view
   {:style (panel theme :raised elevated)
    :onPress on-press
    :accessible true
    :accessibilityRole "button"}
   children))

(defn button
  "Button component"
  [{:keys [theme variant label on-press disabled]}]
  (let [base-style {:paddingVertical 14
                    :paddingHorizontal 24
                    :borderRadius (tokens/get-radius :lg)
                    :alignItems "center"
                    :justifyContent "center"}
        variant-style (case variant
                       :primary {:backgroundColor (tokens/get-color theme :accent)}
                       :secondary {:backgroundColor (tokens/get-color theme :fill)}
                       :outline {:backgroundColor "transparent"
                                 :borderWidth 1
                                 :borderColor (tokens/get-color theme :separator)}
                       {})]
    (touchable-opacity
     {:onPress on-press
      :disabled disabled
      :style (merge base-style variant-style)
      :activeOpacity 0.7}
     (text
      {:style {:color (if (= variant :primary)
                           "#FFFFFF"
                           (tokens/get-color theme :text)
                           :text)
               :fontWeight "700"
               :fontSize 16}}
      label))))

(defn list-item
  "List item component"
  [{:keys [theme title subtitle right-chevron on-press]}]
  (touchable-opacity
   {:onPress on-press
    :style {:flexDirection "row"
            :alignItems "center"
            :padding (tokens/get-spacing :md)
            :backgroundColor (tokens/get-color theme :surface)
            :borderBottomWidth 1
            :borderBottomColor (tokens/get-color theme :separator)}}
   (view {:style {:flex 1}}
    (text
     {:style {:fontSize (tokens/get-type-size :body-medium)
              :color (tokens/get-color theme :text)
              :fontWeight "500"}}
     title)
    (when subtitle
     (text
      {:style {:fontSize (tokens/get-type-size :body-small)
               :color (tokens/get-color theme :secondary)
               :marginTop 2}}
      subtitle)))
   (when right-chevron
    (text
     {:style {:color (tokens/get-color theme :secondary)
              :fontSize 20}}
     "›"))))

(defn badge
  "Badge/Pill component"
  [{:keys [theme color label]}]
  (view
   {:style {:backgroundColor (or color (tokens/get-color theme :accent))
            :paddingHorizontal 8
            :paddingVertical 2
            :borderRadius 12}}
   (text
    {:style {:color "#FFFFFF"
             :fontSize (tokens/get-type-size :caption)
             :fontWeight "600"}}
    label)))

;; ═══════════════════════════════════════════════════════════
;; NAVIGATION COMPONENTS
;; ═══════════════════════════════════════════════════════════

(defn tab-bar-item
  [{:keys [label icon focused theme]}]
  (view
   {:style {:alignItems "center"
            :justifyContent "center"}}
   (text
    {:style {:fontSize 24}}
    icon)
   (text
    {:style {:fontSize (tokens/get-type-size :caption)
             :fontWeight (if focused "700" "600")
             :color (if focused
                      (tokens/get-color theme :accent)
                      (tokens/get-color theme :secondary))
             :marginTop 4}}
    label)))

;; ═══════════════════════════════════════════════════════════
;; DATA DISPLAY COMPONENTS
;; ═══════════════════════════════════════════════════════════

(defn stat-card
  [{:keys [theme title value trend]}]
  (view
   {:style (panel theme)}
   (text
    {:style {:fontSize (tokens/get-type-size :caption)
             :color (tokens/get-color theme :secondary)
             :textTransform "uppercase"
             :letterSpacing 1}}
    title)
   (text
    {:style {:fontSize (tokens/get-type-size :title-large)
             :color (tokens/get-color theme :text)
             :fontWeight "700"
             :marginTop (tokens/get-spacing :xs)}}
    value)
   (when trend
    (text
     {:style {:fontSize (tokens/get-type-size :body-small)
              :color (if (pos? trend)
                       (tokens/get-color :review :good)
                       (tokens/get-color :review :again))
              :marginTop (tokens/get-spacing :xs)}}
     (str (if (pos? trend) "+" "") trend "%")))))

(defn progress-bar
  [{:keys [theme progress color]}]
  (view
   {:style {:height 8
            :backgroundColor (tokens/get-color theme :fill)
            :borderRadius 4
            :overflow "hidden"}}
   (view
    {:style {:width (str (* progress 100) "%")
             :height "100%"
             :backgroundColor (or color (tokens/get-color theme :accent))}})))

;; Export for JS interop
(goog/exportSymbol "BreakdexDSL" #js {:view view
                                       :text text
                                       :button button
                                       :card card
                                       :listItem list-item
                                       :badge badge
                                       :statCard stat-card
                                       :progressBar progress-bar})
