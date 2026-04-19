{:paths ["src/clj" "src/cljs" "target"]
 :deps {org.clojure/clojure {:mvn/version "1.11.1"}
        org.clojure/clojurescript {:mvn/version "1.11.60"}
        reagent/reagent {:mvn/version "1.2.0"}}
 :aliases {:dev {:extra-paths ["dev"]}
          :cljs {:extra-paths ["src/cljs"]}}}