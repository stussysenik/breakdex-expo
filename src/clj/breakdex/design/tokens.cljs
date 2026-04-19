;; Breakdex Design System - EDN Data + Hiccup DSL
;; ==============================================
;; This file defines the complete design system using:
;; - EDN for pure data (colors, spacing, typography)
;; - Hiccup-style functions for component generation  
;; - DOP principles (data-oriented)
;; - FRP for reactive state

(ns breakdex.design.tokens
  "Design tokens as pure EDN data - no functions, just data!"
  (:require [clojure.core]))

;; ═══════════════════════════════════════════════════════════
;; COLORS - IBM Carbon Inspired Palette
;; ═══════════════════════════════════════════════════════════

(def colors
  "All colors as EDN data - easy to transform, theme, export"
  {:light
   {:background "#F8FAFC"
    :surface    "#FFFFFF"
    :fill       "#F1F5F9"
    :text       "#0B0D12"
    :secondary  "#5A6272"
    :separator  "#D9E0EA"
    :accent     "#1F5EFF"
    :error      "#C23B2A"
    :warning    "#B7791F"
    :success    "#1F7A4F"}
   
   :dark
   {:background "#090B10"
    :surface    "#11141B"
    :fill       "#1A1F29"
    :text       "#F7FAFF"
    :secondary  "#A7B1C2"
    :separator  "#283041"
    :accent     "#4F7AFF"
    :error      "#F87171"
    :warning    "#FBBF24"
    :success    "#34D399"}
   
   ;; Learning state semantic colors
   :state
   {:new      "#E45D7A"
    :learning "#2F6BFF"
    :mastery   "#1F8A70"}
   
   ;; Review action colors  
   :review
   {:again "#C23B2A"
    :hard  "#B7791F"
    :good  "#1F7A4F"
    :easy  "#0D9F9A"}})

;; ═══════════════════════════════════════════════════════════
;; SPACING - 4pt Grid System
;; ═══════════════════════════════════════════════════════════

(def spacing
  "Spacing scale - 4px base grid"
  {:xs   4
   :sm   8
   :md   16
   :lg   24
   :xl   32
   :xxl  48
   :edge 20})

(def radius
  "Border radius scale"
  {:xs  6
   :sm  10
   :md  16
   :lg  22
   :xl  30})

;; ═══════════════════════════════════════════════════════════
;; TYPOGRAPHY - IBM Carbon Type Scale
;; ═══════════════════════════════════════════════════════════

(def typography
  "Type scale - sizes in px"
  {:title-large   30
   :title-medium 24
   :title-small  20
   :body-medium  16
   :body-small   14
   :caption      12})

(def font-weights
  "Font weights"
  {:regular 400
   :medium  500
   :semibold 600
   :bold    700})

;; ═══════════════════════════════════════════════════════════
;; SHADOWS - Layered Depth System
;; ═══════════════════════════════════════════════════════════

(def shadows
  "Shadow configurations"
  {:soft  {:blur 12 :offset [0 4] :opacity 0.08}
   :raised {:blur 22 :offset [0 10] :opacity 0.12}
   :focus {:blur 34 :offset [0 16] :opacity 0.18}
   :layered [{:blur 20 :offset [0 0] :opacity 0.04}
             {:blur 16 :offset [0 6] :opacity 0.10}]})

;; ═══════════════════════════════════════════════════════════
;; MOTION - IBM Carbon Motion Scale
;; ═══════════════════════════════════════════════════════════

(def motion
  "Animation durations and curves"
  {:fast-01     70   ; ms
   :fast-02    110
   :moderate-01 150
   :moderate-02 240
   :slow-01     400
   :curves
   {:productive :ease-in-out-cubic
    :expressive  :ease-out-back
    :entrance    :ease-out}})

;; ═══════════════════════════════════════════════════════════
;; GETTERS - Functions to resolve tokens at runtime
;; ═══════════════════════════════════════════════════════════

(defn get-color
  "Get color by path: (get-color :light :text) or (get-color :state :new)"
  [theme color-name]
  (or (get-in colors [theme color-name])
      (get-in colors [:light color-name])
      "#000000"))

(defn get-spacing
  "Get spacing value: (get-spacing :md)"
  [key]
  (or (spacing key) 0))

(defn get-radius
  "Get radius value: (get-radius :md)"
  [key]
  (or (radius key) 0))

(defn get-type-size
  "Get typography size: (get-type-size :title-medium)"
  [key]
  (or (typography key) 16))

;; ═══════════════════════════════════════════════════════════
;; EXPORT - All tokens as single map for theming
;; ═══════════════════════════════════════════════════════════

(def theme
  "Complete theme as single data structure"
  {:colors   colors
   :spacing  spacing
   :radius   radius
   :typography typography
   :font-weights font-weights
   :shadows  shadows
   :motion   motion})

;; Export for JS interop
(goog/exportSymbol "BreakdexTheme" theme)
