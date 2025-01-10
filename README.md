- 👋 Hi, I’m @Liwncy
- 👀 I’m interested in ...
- 🌱 I’m currently learning ...
- 💞️ I’m looking to collaborate on ...
- 📫 How to reach me ...
- 👌 哈哈哈哈哈哈哈
<!---
Liwncy/Liwncy is a ✨ special ✨ repository because its `README.md` (this file) appears on your GitHub profile.
You can click the Preview link to take a look at your changes.
--->
<head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="//unpkg.com/@layui/layui-vue/lib/index.css" />
    <script src="//unpkg.com/vue@3"></script>
    <script src="//unpkg.com/@layui/layui-vue"></script>
</head>
<body>
    <div id="app">
        <lay-button type="primary">{{ message }}</lay-button>
    </div>
    <script>
        const App = {
            data() {
                return {
                    message: "Hello World"
                };
            },
        };
        const app = Vue.createApp(App);
        app.use(LayuiVue);
        app.mount("#app");
    </script>
</body>