var PAGE_ADDRESS = "" + window.location.protocol
    + "//" + window.location.hostname
    + (window.location.port ? ":" + window.location.port : "")
    + "/";

Vue.use(VueLazyload)

Vue.component('gallery-card-item', {
    props: ['item', 'current_dir', 'page_address'],
    template:
        '<div class="col s6 m4 l2">' +
        '   <div class="card tooltip" v-on:click="$emit(\'open_item\', item)">' +
        '     <div class="card-image">' +
        '       <img v-if="item.type == \'directory\'" :src="page_address + \'static/images/directory.png\'"/>' +
        '       <img v-else-if="item.type == \'image\'" v-lazy="page_address + \'getThumbnail\' + current_dir + item.name"/>' +
        '       <img v-else :src="page_address + \'static/images/file.png\'"/>' +
        '     </div>' +
        '     <div class="card-action" v-if="item.type == \'image\'"><a :href="page_address + \'getFile\' + current_dir + item.name" data-lightbox="roadtrip">{{ item.name.substr(0,13) }}</a></div>' +
        '     <div class="card-action" v-else-if="item.type == \'file\'"><a :href="page_address + \'getFile\' + current_dir + item.name+\'?download\'" target="_blank">{{ item.name.substr(0,10) }}</a></div>' +
        '     <div class="card-action" v-else>{{ item.name.substr(0,10) }}</div>' +
        '     <span class="tooltiptext">{{ item.name }}</span>' +
        '   </div>' +
        '</div>'
})

Vue.component('open-dir-tags', {
    props: ['item'],
    template: '<a class="breadcrumb" v-on:click="$emit(\'go_to_dir\', item.id )">{{ item.name }}</a>'
})

let addToHistory = true;

var app = new Vue({
    el: '#app',
    data: {
        error: false,
        loading: true,
        galleryItemList: [],
        openDirs: [],
        currentDir: "/",
        pageTitle: "webGallery",
        filterValue: "",
        isFlatView: false,
        pageAddress: PAGE_ADDRESS
    },
    computed: {
        filteredData() {
            var self = this;

            if (this.filterValue !== undefined && this.filterValue !== '') {
                return this.galleryItemList.filter(function (d) {
                    return d.name.toLocaleLowerCase().indexOf(self.filterValue.toLocaleLowerCase()) !== -1;
                });
            } else {
                return this.galleryItemList;
            }
        }
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
                history.pushState({},  url.substr(1), this.pageAddress + url.substr(1));
            else
                addToHistory = true;

            this.isFlatView = url.endsWith("?flat=yes");
            this.loading = true
            axios.get(this.pageAddress + "getDirContent" + url)
                .then(response => {
                    this.error = false;
                    this.galleryItemList = response.data;
                    document.title = this.pageTitle + " - " + this.openDirs[this.openDirs.length - 1].name;
                })
                .catch(error => {
                    console.log(error);
                    this.error = true;
                })
                .finally(() => this.loading = false)
        },
        updatePath: function (dir) {
            this.openDirs = [{id: 0, name: "/"}];

            if (dir === "/") {
                this.currentDir = "/"
                return;
            }

            let dirs = dir.split("/");
            if(dirs[0].length === 0)
                dirs.shift();

            for (let dir of dirs)
                this.openDirs.push({id: this.openDirs.length, name: decodeURIComponent(dir)});

            this.currentDir = this.generatePathToCurrent();
        },
        atStart: function (dir) {
            this.openDirs = [];
            let start_dir = ("" + document.location).slice(this.pageAddress.length - 1);
            this.fetchDirectory(start_dir);
            this.updatePath(start_dir);
        },
        flatView: function() {
            addToHistory = false
            this.fetchDirectory(this.generatePathToCurrent() + "?flat=yes");
        },
        dirView: function() {
            addToHistory = false
            this.fetchDirectory(this.generatePathToCurrent());
        }
    },
    mounted() {
        this.pageTitle = document.title;
        this.atStart()
    }
})

window.onpopstate = () => {
    addToHistory = false;
    app.atStart();
}