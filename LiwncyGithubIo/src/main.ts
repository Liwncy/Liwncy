import {createApp} from 'vue'
import Router from './router'
import Store from './store'
import App from './App.vue'
import {permission} from "./directives/permission";
import './mockjs'

import Layui from '@layui/layui-vue'
import LayJsonSchemaForm from "@layui/json-schema-form";

import LayCode from "./components/LayCode.vue";
import LaySearch from "./components/LaySearch.vue";
import LayTableBox from "./components/LayTableBox.vue";
import LayAnchor from "./components/LayAnchor.vue";
import LayContributor from "./components/LayContributor.vue";

import Children from "./document/zh-CN/components/components/Children.vue";
import Children1 from "./document/zh-CN/components/components/Children1.vue";
import Children2 from "./document/zh-CN/components/components/Children2.vue";

import '@layui/layui-vue/lib/index.css'
import "./assets/styles/index.css";

const app = createApp(App)

app.use(Store)
    .use(Router)
    .use(Layui)
    .use(LayJsonSchemaForm);
app.component("Children", Children)
    .component("Children1", Children1)
    .component("Children2", Children2)
    .component("LayCode", LayCode)
    .component("LaySearch", LaySearch)
    .component("LayTableBox", LayTableBox)
    .component("LayAnchor", LayAnchor)
    .component("LayContributor", LayContributor);

app.directive("permission", permission);
app.mount('#app');
