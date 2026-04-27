(ns breakdex.ui.carbon
  (:require [breakdex.design.tokens :as tokens]
            [breakdex.uix :as uix]))

(defn screen-shell [theme & children]
  (into
   [uix/scroll-view
    {:style {:flex 1}
     :content-container-style {:padding (tokens/get-spacing :edge)
                               :padding-bottom (+ (tokens/get-spacing :xl) 84)}
     :shows-vertical-scroll-indicator false}]
   children))

(defn page-header [{:keys [theme eyebrow title subtitle action]}]
  [uix/view {:class-name "gap-2"
             :style {:margin-bottom (tokens/get-spacing :md)}}
   (when eyebrow
     [uix/text {:style {:color (tokens/get-color theme :secondary)
                        :font-size (tokens/get-type-size :caption)
                        :font-family (tokens/get-font :sansSemiBold)
                        :text-transform "uppercase"
                        :letter-spacing 0.8}}
      eyebrow])
   [uix/view {:class-name "gap-1"}
    [uix/text {:style {:color (tokens/get-color theme :text)
                       :font-size (tokens/get-type-size :title-large)
                       :line-height (tokens/get-line-height :title-large)
                       :font-family (tokens/get-font :sansBold)}}
     title]
    (when subtitle
      [uix/text {:style {:color (tokens/get-color theme :secondary)
                         :font-size (tokens/get-type-size :body-small)
                         :line-height (tokens/get-line-height :body-small)
                         :font-family (tokens/get-font :sansRegular)}}
       subtitle])]
   (when action
     [uix/view {:style {:margin-top (tokens/get-spacing :sm)}} action])])

(defn tile [{:keys [theme class-name style]} & children]
  (into
   [uix/view
    {:class-name class-name
     :style (merge {:background-color (tokens/get-color theme :surface)
                    :border-width 1
                    :border-color (tokens/get-color theme :separator)
                    :border-radius (tokens/get-radius :md)
                    :padding (tokens/get-spacing :md)}
                   style)}]
   children))

(defn section-label [{:keys [theme label]}]
  [uix/text {:style {:color (tokens/get-color theme :secondary)
                     :font-size (tokens/get-type-size :caption)
                     :font-family (tokens/get-font :sansSemiBold)
                     :text-transform "uppercase"
                     :letter-spacing 0.8
                     :margin-bottom (tokens/get-spacing :xs)}}
   label])

(defn inline-tag [{:keys [theme label tone]}]
  [uix/view
   {:style {:align-self "flex-start"
            :border-width 1
            :border-color (tokens/get-tone-color theme tone)
            :border-radius (tokens/get-radius :xl)
            :padding-horizontal (tokens/get-spacing :sm)
            :padding-vertical 6}}
   [uix/text {:style {:color (tokens/get-tone-color theme tone)
                      :font-size (tokens/get-type-size :caption)
                      :font-family (tokens/get-font :sansSemiBold)}}
    label]])

(defn metric-tile [{:keys [theme label value tone]}]
  [tile {:theme theme
         :class-name "flex-1"
         :style {:min-width 120}}
   [uix/text {:style {:color (tokens/get-color theme :secondary)
                      :font-size (tokens/get-type-size :caption)
                      :font-family (tokens/get-font :sansRegular)
                      :margin-bottom (tokens/get-spacing :xs)}}
    label]
   [uix/text {:style {:color (tokens/get-tone-color theme tone)
                      :font-size (tokens/get-type-size :title-small)
                      :line-height (tokens/get-line-height :title-small)
                      :font-family (tokens/get-font :sansBold)}}
    value]])

(defn app-button [{:keys [theme label on-press kind class-name]}]
  (let [kind (or kind :primary)
        background (case kind
                     :secondary (tokens/get-color theme :surface)
                     :ghost (tokens/get-color theme :background)
                     :danger (tokens/get-color theme :error)
                     (tokens/get-color theme :accent))
        border (case kind
                 :primary (tokens/get-color theme :accent)
                 :danger (tokens/get-color theme :error)
                 (tokens/get-color theme :separator))
        text-color (case kind
                     :primary (tokens/get-color theme :textInverse)
                     :danger (tokens/get-color theme :textInverse)
                     (tokens/get-color theme :text))]
    [uix/touchable
     {:class-name class-name
      :on-press on-press
      :style {:background-color background
              :border-width 1
              :border-color border
              :border-radius (tokens/get-radius :md)
              :padding-horizontal (tokens/get-spacing :md)
              :padding-vertical (tokens/get-spacing :controlY)
              :align-items "center"
              :justify-content "center"}}
     [uix/text {:style {:color text-color
                        :font-size (tokens/get-type-size :body-small)
                        :font-family (tokens/get-font :sansSemiBold)}}
      label]]))

(defn text-field [{:keys [theme label value placeholder on-change-text helper]}]
  [uix/view {:class-name "gap-2"}
   [section-label {:theme theme :label label}]
   [uix/text-input
    {:value value
     :placeholder placeholder
     :placeholder-text-color (tokens/get-color theme :secondary)
     :on-change-text on-change-text
     :class-name "w-full"
     :style {:background-color (tokens/get-color theme :background)
             :border-width 1
             :border-color (tokens/get-color theme :separator)
             :border-radius (tokens/get-radius :sm)
             :color (tokens/get-color theme :text)
             :font-size (tokens/get-type-size :body-medium)
             :font-family (tokens/get-font :sansRegular)
             :padding-horizontal (tokens/get-spacing :md)
             :padding-vertical (tokens/get-spacing :controlY)}}]
   (when helper
     [uix/text {:style {:color (tokens/get-color theme :secondary)
                        :font-size (tokens/get-type-size :caption)
                        :font-family (tokens/get-font :sansRegular)}}
      helper])])

(defn detail-row [{:keys [theme title subtitle trailing on-press]}]
  [uix/touchable
   {:on-press on-press
    :style {:background-color (tokens/get-color theme :surface)
            :border-width 1
            :border-color (tokens/get-color theme :separator)
            :border-radius (tokens/get-radius :md)
            :padding (tokens/get-spacing :md)
            :margin-bottom (tokens/get-spacing :sm)}}
   [uix/view {:style {:flex-direction "row"
                      :justify-content "space-between"
                      :align-items "center"
                      :gap (tokens/get-spacing :sm)}}
    [uix/view {:style {:flex 1}}
     [uix/text {:style {:color (tokens/get-color theme :text)
                        :font-size (tokens/get-type-size :body-medium)
                        :font-family (tokens/get-font :sansSemiBold)}}
      title]
     (when subtitle
       [uix/text {:style {:color (tokens/get-color theme :secondary)
                          :font-size (tokens/get-type-size :body-small)
                          :line-height (tokens/get-line-height :body-small)
                          :font-family (tokens/get-font :sansRegular)
                          :margin-top 4}}
        subtitle])]
    trailing]])

(defn empty-state [{:keys [theme title body action]}]
  [tile {:theme theme}
   [uix/text {:style {:color (tokens/get-color theme :text)
                      :font-size (tokens/get-type-size :title-small)
                      :line-height (tokens/get-line-height :title-small)
                      :font-family (tokens/get-font :sansBold)
                      :margin-bottom (tokens/get-spacing :xs)}}
    title]
   [uix/text {:style {:color (tokens/get-color theme :secondary)
                      :font-size (tokens/get-type-size :body-small)
                      :line-height (tokens/get-line-height :body-small)
                      :font-family (tokens/get-font :sansRegular)}}
    body]
   (when action
     [uix/view {:style {:margin-top (tokens/get-spacing :md)}} action])])
