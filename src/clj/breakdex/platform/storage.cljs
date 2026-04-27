(ns breakdex.platform.storage)

(def storage-labels
  {:local "Local storage"
   :cloud "Cloud storage"})

(def sync-labels
  {:in-sync "In sync"
   :syncing "Syncing"
   :local-only "Local only"
   :cloud-only "Cloud only"
   :needs-review "Needs review"})

(def sync-tones
  {:in-sync :mastery
   :syncing :review
   :local-only :accent
   :cloud-only :learning
   :needs-review :danger})

(defn storage-label [scope]
  (get storage-labels scope "Unknown storage"))

(defn sync-label [status]
  (get sync-labels status "Unknown state"))

(defn sync-tone [status]
  (get sync-tones status :default))

(defn asset-detail [{:asset/keys [source bytes]}]
  (str source " • " bytes))
