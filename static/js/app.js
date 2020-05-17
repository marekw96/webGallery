Vue.component('gallery-card-item', {
  props: ['item', 'current_dir'],
  template:
      '<div class="col s6 m4 l2">' +
      '   <div class="card" v-on:click="$emit(\'open_item\', item)">' +
      '     <div class="card-image">' +
      '       <img v-if="item.type == \'directory\'" src="static/images/directory.png"/>' +
      '       <img v-else-if="item.type == \'image\'" :src="\'getThumbnail/\' + current_dir + item.name"/>' +
      '       <img v-else src="static/images/file.png"/>' +
      '     </div>' +
      '     <div class="card-action" v-if="item.type == \'image\'"><a :href="\'getFile/\' + current_dir + item.name" data-lightbox="roadtrip">{{ item.name }}</a></div>' +
      '     <div class="card-action" v-else>{{ item.name }}</div>' +
      '   </div>' +
      '</div>'
})

Vue.component('open-dir-tags', {
  props: ['item'],
  template: '<div class="chip" v-on:click="$emit(\'go_to_dir\', item.id )">{{ item.name }}</div>'
})

var app7 = new Vue({
  el: '#app-7',
  data: {
    error: false,
    loading: true,
    galleryItemList: [],
    openDirs: [],
    currentDir: "/"
  },
  methods: {
    generatePathToIndex: function(index) {
      let current = "";
      for(let i = 0; i < index; ++i) {
        current += this.openDirs[i].name;
        if(current[current.length -1] !== '/')
          current += "/"
      }
      return current;
    },
    generatePathToCurrent: function() {
      return this.generatePathToIndex(this.openDirs.length)
    },
    openItem: function (item) {
      if(item.type === "directory")
      {
        this.fetchDirectory(this.generatePathToCurrent() + "/" + item.name);
        this.openDirs.push({id: this.openDirs.length, name: item.name});
        this.currentDir = this.generatePathToCurrent();
      }
    },
    goToDir: function(index) {
      this.fetchDirectory(this.generatePathToIndex(index+1));
      this.openDirs.splice(index+1, this.openDirs.length);
    },
    fetchDirectory: function(url) {
      this.loading = true
      axios.get("/getDirContent"+url)
        .then(response => {
          this.error = false;
          this.galleryItemList = response.data;
        })
        .catch(error => {
          console.log(error);
          this.error = true;
        })
        .finally(() => this.loading = false)
    }
  },
  mounted() {
    this.fetchDirectory("/");
    this.openDirs.push({id: this.openDirs.length, name: "/"});
    this.currentDir = this.generatePathToCurrent();
  }
})


