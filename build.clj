;; Build script for React Native - CommonJS output
(require '[cljs.build.api :as api])

(println "Building Breakdex for React Native (node-module)...")

(api/build
 "src/clj/breakdex/core.cljs"
 {:target :node-module
  :output-to "target/main.js" 
  :module-format :commonjs
  :optimizations :none
  :language-in :es6})

(println "Build complete!")