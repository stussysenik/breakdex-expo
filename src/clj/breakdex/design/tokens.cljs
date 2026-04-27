(ns breakdex.design.tokens
  (:require [breakdex.design.generated-tokens :as generated]))

(def carbon-tokens generated/carbon-tokens)
(def spacing generated/space)
(def radius generated/radius)
(def typography generated/type-scale)
(def line-height generated/line-height)
(def fonts generated/font)

(defn- fallback-mode [mode]
  (if (contains? #{:light :dark} mode) mode :light))

(defn get-color [mode token]
  (get-in generated/color [(fallback-mode mode) token] "#161616"))

(defn get-state-color [mode token]
  (get-in generated/color [:state token (fallback-mode mode)] (get-color mode :accent)))

(defn get-review-rating-color [token]
  (get-in generated/color [:reviewRating token] (get-color :light :accent)))

(defn get-spacing [token]
  (get spacing token 0))

(defn get-radius [token]
  (get radius token 0))

(defn get-type-size [token]
  (get typography token 16))

(defn get-line-height [token]
  (get line-height token 24))

(defn get-font [token]
  (get fonts token "System"))

(defn get-tone-color [mode tone]
  (case tone
    :accent (get-color mode :accent)
    :learning (get-state-color mode :learning)
    :review (get-state-color mode :review)
    :mastery (get-state-color mode :mastery)
    :danger (get-color mode :error)
    (get-color mode :secondary)))
