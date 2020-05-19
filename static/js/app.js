var PAGE_ADDRESS = "" + window.location.protocol
    + "//" + window.location.hostname
    + (window.location.port === 80 ? "" : ":" + window.location.port);

Vue.use(VueLazyload)

Vue.component('gallery-card-item', {
    props: ['item', 'current_dir'],
    template:
        '<div class="col s6 m4 l2">' +
        '   <div class="card" v-on:click="$emit(\'open_item\', item)">' +
        '     <div class="card-image">' +
        '       <img v-if="item.type == \'directory\'" src="static/images/directory.png"/>' +
        '       <img v-else-if="item.type == \'image\'" v-lazy="\'getThumbnail/\' + current_dir + item.name" width="125px" height="125px"/>' +
        '       <img v-else src="static/images/file.png"/>' +
        '     </div>' +
        '     <div class="card-action" v-if="item.type == \'image\'"><a :href="\'getFile/\' + current_dir + item.name" data-lightbox="roadtrip">{{ item.name.substr(0,13) }}</a></div>' +
        '     <div class="card-action" v-else-if="item.type == \'file\'"><a :href="\'getFile/\' + current_dir + item.name+\'?download\'">{{ item.name.substr(0,10) }}</a></div>' +
        '     <div class="card-action" v-else>{{ item.name.substr(0,10) }}</div>' +
        '   </div>' +
        '</div>'
})

Vue.component('open-dir-tags', {
    props: ['item'],
    template: '<div class="chip" v-on:click="$emit(\'go_to_dir\', item.id )">{{ item.name }}</div>'
})

let addToHistory = true;

var app = new Vue({
    el: '#app',
    data: {
        error: false,
        loading: true,
        galleryItemList: [],
        openDirs: [],
        currentDir: "/"
    },
    methods: {
        generatePathToIndex: function (index) {
            let current = "";
            for (let i = 0; i < index && i < this.openDirs.length; ++i) {
                current += this.openDirs[i].name;
                if (current[current.length - 1] !== '/')
                    current += "/";
            }
            if (current[current.length - 1] === '/')
                current = current.slice(0, -1);

            return current;
        },
        addToCurrentPath: function (dir) {
            let current = this.generatePathToCurrent();
            if (current[current.length - 1] !== '/')
                current += "/"

            return current + dir
        },
        generatePathToCurrent: function () {
            return this.generatePathToIndex(this.openDirs.length)
        },
        openItem: function (item) {
            if (item.type === "directory") {
                this.fetchDirectory(this.addToCurrentPath(item.name));
                this.openDirs.push({id: this.openDirs.length, name: item.name});
                this.currentDir = this.generatePathToCurrent();
            }
        },
        goToDir: function (index) {
            let dir = this.generatePathToIndex(index + 1);
            this.fetchDirectory(dir);
            this.openDirs = [];
            this.updatePath(dir);
        },
        fetchDirectory: function (url) {
            if (addToHistory)
                history.pushState({}, url, "?" + url);
            else
                addToHistory = true;

            this.loading = true
            axios.get("/getDirContent" + url)
                .then(response => {
                    this.error = false;
                    this.galleryItemList = response.data;
                })
                .catch(error => {
                    console.log(error);
                    this.error = true;
                })
                .finally(() => this.loading = false)
        },
        updatePath: function (dir) {
            this.openDirs.push({id: 0, name: "/"});

            if (dir === "/") {
                this.openDirs = [{id: 0, name: "/"}];
                this.currentDir = "/"
                return;
            }

            let dirs = dir.split("/");
            dirs.shift();
            for (let dir of dirs)
                this.openDirs.push({id: this.openDirs.length, name: decodeURIComponent(dir)});

            this.currentDir = this.generatePathToCurrent();
        },
        atStart: function (dir) {
            this.openDirs = [];
            let start_dir = ("" + document.location).slice(PAGE_ADDRESS.length + 2);
            this.fetchDirectory(start_dir);
            this.updatePath(start_dir);
        }
    },
    mounted() {
        this.atStart()
    }
})

window.onpopstate = () => {
    addToHistory = false;
    app.atStart();
}