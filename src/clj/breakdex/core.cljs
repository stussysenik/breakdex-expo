;; Breakdex - minimal core for React Native
(ns breakdex.core
  (:require [breakdex.design.tokens :as tokens]))

(goog/exportSymbol "BreakdexTheme" tokens/theme)
(goog/exportSymbol "BreakdexColors" tokens/colors)
(goog/exportSymbol "BreakdexGetColor" tokens/get-color)
(goog/exportSymbol "BreakdexSpacing" tokens/spacing)

(println "Breakdex loaded!")