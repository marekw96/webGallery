var PAGE_ADDRESS = "" + window.location.protocol
    + "//" + window.location.hostname
    + (window.location.port ? ":" + window.location.port : "")
    + "/";

Vue.use(VueLazyload)

Vue.component('gallery-card-item-folder', {
    props: ['item', 'current_dir', 'page_address'],
    template: `
<div v-on:click="$emit(\'open_item\', item)" class="file-card group bg-[#1a2121] p-4 rounded-xl border border-[#2a3535] shadow-sm cursor-pointer flex flex-col items-center justify-center text-center">
    <div class="w-16 h-16 mb-3 text-emerald-500/80 flex items-center justify-center">
        <svg class="w-full h-full" fill="currentColor" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path>
        </svg>
    </div>
    <span class="text-sm font-medium truncate w-full px-2 text-slate-200" title="{{ item.name }}">{{ item.name }}</span>
    <span class="text-xs text-slate-500 mt-1"></span>
</div>
`
})

Vue.component('gallery-card-item-file', {
    props: ['item', 'current_dir', 'page_address'],
    template: `
<div v-on:click="window.open(page_address + \'getFile\' + current_dir + item.name+\'?download=yes\', '_blank')" class="file-card group bg-[#1a2121] p-4 rounded-xl border border-[#2a3535] shadow-sm cursor-pointer flex flex-col items-center justify-center text-center">
    <div class="w-16 h-16 mb-3 text-emerald-500/80 flex items-center justify-center">
<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path>
</svg>
    </div>
    <span class="text-sm font-medium truncate w-full px-2 text-slate-200" title="{{ item.name }}">{{ item.name }}</span>
    <span class="text-xs text-slate-500 mt-1"></span>
</div>
`
})

Vue.component('gallery-card-item-image', {
    props: ['item', 'current_dir', 'page_address'],
    template: `
<div v-on:click="$emit(\'open_item\', item)" class="file-card bg-[#1a2121] rounded-xl border border-[#2a3535] shadow-sm overflow-hidden cursor-pointer flex flex-col">
    <div class="aspect-square w-full overflow-hidden bg-[#2a3535]">
        <a :href="page_address + \'getFile\' + current_dir + item.name" data-lightbox="roadtrip">
            <img class="w-full h-full object-cover" width="100%" height="100%" v-lazy="page_address + \'getThumbnail\' + current_dir + item.name" class="image_thumbnail"/>
        </a>
    </div>
</div>
    `
})

Vue.component('gallery-card-item-video', {
    props: ['item', 'current_dir', 'page_address'],
    template: `
<div v-on:click="$emit(\'open_video\', item)" class="file-card bg-[#1a2121] rounded-xl border border-[#2a3535] shadow-sm overflow-hidden cursor-pointer flex flex-col">
    <div class="aspect-square w-full overflow-hidden bg-[#2a3535] relative">
        <img class="w-full h-full object-cover image_thumbnail" width="100%" height="100%" v-lazy="page_address + \'getThumbnail\' + current_dir + item.name"/>
        <div class="absolute inset-0 flex items-center justify-center bg-black/30">
            <div class="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                <svg class="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"></path>
                </svg>
            </div>
        </div>
    </div>
    <span class="text-xs font-medium truncate w-full px-2 py-2 text-slate-300" title="{{ item.name }}">{{ item.name }}</span>
</div>
    `
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
        pageAddress: PAGE_ADDRESS,
        activeVideo: null
    },
    computed: {
        displayedItems() {
            var self = this;

            if (this.filterValue !== undefined && this.filterValue !== '') {
                return this.galleryItemList.filter(function (d) {
                    return d.name.toLocaleLowerCase().indexOf(self.filterValue.toLocaleLowerCase()) !== -1;
                });
            } else {
                return this.galleryItemList;
            }
        },
        filteredData() {
            var self = this;

            if (this.filterValue !== undefined && this.filterValue !== '') {
                return this.galleryItemList.filter(function (d) {
                    return d.type != "image" && d.type != "video" && d.name.toLocaleLowerCase().indexOf(self.filterValue.toLocaleLowerCase()) !== -1;
                });
            } else {
                return this.galleryItemList.filter(function (d) {
                    return d.type != "image" && d.type != "video";
                });
            }
        },
        filteredImages() {
            var self = this;

            if (this.filterValue !== undefined && this.filterValue !== '') {
                return this.galleryItemList.filter(function (d) {
                    return d.type == "image" && d.name.toLocaleLowerCase().indexOf(self.filterValue.toLocaleLowerCase()) !== -1;
                });
            } else {
                return this.galleryItemList.filter(function (d) {
                    return d.type == "image";
                });
            }
        },
        filteredVideos() {
            var self = this;

            if (this.filterValue !== undefined && this.filterValue !== '') {
                return this.galleryItemList.filter(function (d) {
                    return d.type == "video" && d.name.toLocaleLowerCase().indexOf(self.filterValue.toLocaleLowerCase()) !== -1;
                });
            } else {
                return this.galleryItemList.filter(function (d) {
                    return d.type == "video";
                });
            }
        },
        activeVideoUrl() {
            if (!this.activeVideo) {
                return "";
            }
            return this.pageAddress + "getFile" + this.currentDir + "/" + this.activeVideo.name;
        },
        activeVideoPoster() {
            if (!this.activeVideo) {
                return "";
            }
            return this.pageAddress + "getThumbnail" + this.currentDir + "/" + this.activeVideo.name;
        }
    },
    methods: {
        resolveItemComponent: function (item) {
            if (item.type === 'directory') {
                return 'gallery-card-item-folder';
            }
            if (item.type === 'image') {
                return 'gallery-card-item-image';
            }
            if (item.type === 'video') {
                return 'gallery-card-item-video';
            }
            return 'gallery-card-item-file';
        },
        openVideo: function (item) {
            this.activeVideo = item;
        },
        closeVideo: function () {
            var videoEl = this.$refs.videoPlayer;
            if (videoEl) {
                videoEl.pause();
                videoEl.removeAttribute("src");
                videoEl.load();
            }
            this.activeVideo = null;
        },
        onVideoKeydown: function (event) {
            if (event.key === "Escape" && this.activeVideo) {
                this.closeVideo();
            }
        },

        generatePathToIndex: function (index) {
            let current = "";
            for (let i = 0; i < index && i < this.openDirs.length; ++i) {
                current += this.openDirs[i].name;
                if (current[current.length - 1] !== '/')
                    current += "/";
            }
            if (current[current.length - 1] === '/')
                current = current.slice(0, -1);

            if(current.length == 0)
                current += "/";

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
            if(url.length == 0)
                return

            if (addToHistory)
                history.pushState({},  url.substr(1), this.pageAddress + url.substr(1));
            else
                addToHistory = true;

            this.isFlatView = url.endsWith("?flat=yes");
            this.loading = true
            axios.get(this.pageAddress + "getDirContent" + url)
                .then(response => {
                    console.log("fetchDir", url, response);

                    this.error = false;
                    this.galleryItemList = response.data;
                    const currentDirItem = this.openDirs && this.openDirs.length > 0 ? this.openDirs[this.openDirs.length - 1] : null;
                    if (currentDirItem && currentDirItem.name && currentDirItem.name !== "/") {
                        document.title = this.pageTitle + " - " + currentDirItem.name;
                    } else {
                        document.title = this.pageTitle;
                    }
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
        },
        toggleView: function() {
            console.log("toogleView");
            if(!this.loading)
                this.flatView();
        }
    },
    mounted() {
        this.pageTitle = document.title;
        this.atStart();
        window.addEventListener("keydown", this.onVideoKeydown);
    },
    beforeDestroy() {
        window.removeEventListener("keydown", this.onVideoKeydown);
    }
})

window.onpopstate = () => {
    addToHistory = false;
    app.atStart();
}