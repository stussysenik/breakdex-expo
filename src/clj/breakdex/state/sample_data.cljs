(ns breakdex.state.sample-data)

(def nav-tabs
  [{:key :arsenal :label "Arsenal"}
   {:key :review :label "Review"}
   {:key :library :label "Library"}
   {:key :sync :label "Sync"}
   {:key :settings :label "Settings"}])

(def moves
  [{:move/id "move-toprock-thread"
    :move/name "Threaded Toprock"
    :move/category "Toprock"
    :move/learning-state :new
    :move/notes "Lead with posture. Keep the shoulder roll deliberate."
    :move/review-due? true
    :move/asset-id "asset-toprock-thread"}
   {:move/id "move-swipe-lift"
    :move/name "Swipe Lift"
    :move/category "Power"
    :move/learning-state :review
    :move/notes "Snap the hips before the second hand leaves the floor."
    :move/review-due? true
    :move/asset-id "asset-swipe-lift"}
   {:move/id "move-chair-freeze"
    :move/name "Chair Freeze Exit"
    :move/category "Freezes"
    :move/learning-state :mastery
    :move/notes "Hold the exit for a clean count before transitioning."
    :move/review-due? false
    :move/asset-id "asset-chair-freeze"}
   {:move/id "move-sixstep-switch"
    :move/name "Six-Step Switch"
    :move/category "Footwork"
    :move/learning-state :learning
    :move/notes "Keep the level low and drive the weight transfer through the hands."
    :move/review-due? true
    :move/asset-id "asset-sixstep-switch"}])

(def flow-links
  [{:flow/id "flow-open-round"
    :flow/title "Open round"
    :flow/moves ["move-toprock-thread" "move-sixstep-switch" "move-chair-freeze"]
    :flow/status :in-sync}
   {:flow/id "flow-power-pocket"
    :flow/title "Power pocket"
    :flow/moves ["move-swipe-lift" "move-chair-freeze"]
    :flow/status :syncing}])

(def assets
  [{:asset/id "asset-toprock-thread"
    :asset/name "threaded-toprock.mov"
    :asset/source "Camera roll"
    :asset/bytes "42 MB"
    :asset/storage-scope :local
    :asset/sync-status :local-only}
   {:asset/id "asset-swipe-lift"
    :asset/name "swipe-lift-slowmo.mov"
    :asset/source "Practice archive"
    :asset/bytes "118 MB"
    :asset/storage-scope :cloud
    :asset/sync-status :in-sync}
   {:asset/id "asset-chair-freeze"
    :asset/name "chair-freeze-angle-b.mov"
    :asset/source "Coach share"
    :asset/bytes "64 MB"
    :asset/storage-scope :cloud
    :asset/sync-status :needs-review}
   {:asset/id "asset-sixstep-switch"
    :asset/name "sixstep-switch-loop.mov"
    :asset/source "Device export"
    :asset/bytes "51 MB"
    :asset/storage-scope :local
    :asset/sync-status :syncing}])
