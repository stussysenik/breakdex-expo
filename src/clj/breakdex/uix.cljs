(ns breakdex.uix
  (:require [clojure.string :as str]
            [reagent.core :as r]
            ["react-native" :as rn]))

(def current-theme (r/atom :light))

(defn get-theme []
  @current-theme)

(defn set-theme! [theme]
  (reset! current-theme theme))

(defn- camel-case [value]
  (let [[head & tail] (str/split (name value) #"-")]
    (apply str head (map str/capitalize tail))))

(defn- style-key [key]
  (case key
    :z-index "zIndex"
    :shadow-color "shadowColor"
    :shadow-opacity "shadowOpacity"
    :shadow-offset "shadowOffset"
    :shadow-radius "shadowRadius"
    :text-align-vertical "textAlignVertical"
    :text-transform "textTransform"
    :font-family "fontFamily"
    :font-size "fontSize"
    :font-weight "fontWeight"
    :line-height "lineHeight"
    :letter-spacing "letterSpacing"
    :border-radius "borderRadius"
    :border-width "borderWidth"
    :border-color "borderColor"
    :border-top-width "borderTopWidth"
    :border-top-color "borderTopColor"
    :border-bottom-width "borderBottomWidth"
    :border-bottom-color "borderBottomColor"
    :min-height "minHeight"
    :min-width "minWidth"
    :max-height "maxHeight"
    :max-width "maxWidth"
    :padding-horizontal "paddingHorizontal"
    :padding-vertical "paddingVertical"
    :padding-top "paddingTop"
    :padding-bottom "paddingBottom"
    :padding-left "paddingLeft"
    :padding-right "paddingRight"
    :margin-horizontal "marginHorizontal"
    :margin-vertical "marginVertical"
    :margin-top "marginTop"
    :margin-bottom "marginBottom"
    :margin-left "marginLeft"
    :margin-right "marginRight"
    :background-color "backgroundColor"
    :flex-direction "flexDirection"
    :flex-wrap "flexWrap"
    :justify-content "justifyContent"
    :align-items "alignItems"
    :align-self "alignSelf"
    :text-align "textAlign"
    (camel-case key)))

(declare style->js)

(defn- style-value [value]
  (cond
    (map? value) (style->js value)
    (vector? value) (clj->js (map style-value value))
    :else value))

(defn style->js [style]
  (cond
    (nil? style) nil
    (vector? style) (clj->js (map style->js style))
    (map? style)
    (clj->js
     (reduce-kv
      (fn [acc key value]
        (assoc acc (style-key key) (style-value value)))
      {}
      style))
    :else style))

(defn- prop-key [key]
  (case key
    :class-name "className"
    :test-id "testID"
    :on-press "onPress"
    :on-change-text "onChangeText"
    :placeholder-text-color "placeholderTextColor"
    :keyboard-should-persist-taps "keyboardShouldPersistTaps"
    :content-container-style "contentContainerStyle"
    :safe-area-edges "edges"
    :accessibility-role "accessibilityRole"
    :accessibility-label "accessibilityLabel"
    :scroll-enabled "scrollEnabled"
    :shows-vertical-scroll-indicator "showsVerticalScrollIndicator"
    :text-align-vertical "textAlignVertical"
    (camel-case key)))

(defn- prop-value [key value]
  (case key
    :style (style->js value)
    :content-container-style (style->js value)
    :safe-area-edges (clj->js value)
    value))

(defn- props->js [props]
  (when props
    (clj->js
     (reduce-kv
      (fn [acc key value]
        (assoc acc (prop-key key) (prop-value key value)))
      {}
      props))))

(defn- element [component props children]
  (into [:> component (props->js props)] children))

(defn view [props & children]
  (element rn/View props children))

(defn text [props & children]
  (element rn/Text props children))

(defn scroll-view [props & children]
  (element rn/ScrollView props children))

(defn pressable [props & children]
  (element rn/Pressable props children))

(defn touchable [props & children]
  (element rn/TouchableOpacity props children))

(defn text-input [props]
  [:> rn/TextInput (props->js props)])

(defn safe-area-view [props & children]
  (element rn/SafeAreaView props children))
