import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

(() => {
  if (navigator.serviceWorker != null) {
    navigator.serviceWorker
      .register("sw.js")
      .then(swReg => {
        console.log("support sw", swReg.scope);
      })
      .catch(error => {
        console.error("Service Worker Error", error);
      });
  } else {
    console.warn("Push messaging is not supported");
  }
})();

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
