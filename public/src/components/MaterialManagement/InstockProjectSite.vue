<template>
  <div>
    <v-card flat >
      <v-card-text>
        <v-row no-gutters>
          <v-col cols="5">
            <v-card flat dense >
              <v-list
                dense
                :style="{ height: windowHeight + 'px', overflowY: 'auto' }"
              >
                <transition-group name="fade-slide" tag="div" class="pa-2">
                  <v-list-item
                    v-for="(item, i) in projectSiteItems"
                    :key="item.location_name + i"
                    class="my-2 custom-outline"
                    @click="load_locations(i)"
                    :class="{
                      'active-item':
                        selectedLocation &&
                        selectedLocation.location_name === item.location_name,
                    }"
                    :style="{
                      animation: `slide-in 0.5s ease ${i * 0.1}s forwards`,
                    }"
                  >
                    <v-list-item-content>
                      <v-list-item-title
                        v-text="item.location_name"
                      ></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </transition-group>
              </v-list>
            </v-card>
          </v-col>
          <v-col cols="7">
            <v-card class=" ml-3" v-if="selectedLocation">
              <v-subheader v-if="selectedLocation">
                <strong>{{ selectedLocation.location_name }}</strong>
              </v-subheader>
              <v-card-text>
                <v-list class="mt-n2" dense>
                  <v-list-item v-for="(stock, i) in selectedMaterials" :key="i">
                    <v-list-item-icon>
                      <v-icon dense x-small color="grey">mdi-circle</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="" style="font-size: 13px">
                        <strong>{{ stock.material_name }}</strong>
                        -
                        {{ stock.material_quantity }} ({{
                          stock.material_unit
                        }})
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- <v-row no-gutters>
          <v-col
            cols="12"
            sm="4"
            md="4"
            lg="4"
            v-for="(item, i) in projectSiteItems"
            :key="i"
          >
            <v-card class="ma-2">
              <v-card-title style="font-size: 15px" class="primary--text">
                :style="{ color: getRandomColor() }"
                <v-icon :color="getRandomColor()" class="mr-2">{{ getRandomIcon() }}</v-icon>
                <v-icon dense color="primary" class="mr-2">mdi-city</v-icon>
                <span class="mt-n1">{{ item.location_name }} </span>
              </v-card-title>
              <v-card-text>
                <v-list dense>
                  <v-list-item v-for="(stock, i) in item.stocks" :key="i">
                    <v-list-item-icon>
                      <v-icon dense x-small color="grey">mdi-circle</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="" style="font-size: 13px">
                        <strong>{{ stock.material_name }}</strong>
                        -
                        {{ stock.material_quantity }} ({{
                          stock.material_unit
                        }})
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
               
              </v-card-text>
            </v-card>
          
          </v-col>
        </v-row> -->
        <!-- <div v-for="item in projectSiteItems" :key="item.material_id">
          <v-card class="">
            <v-card-title>{{ item.name }}</v-card-title>
            <v-card-text> </v-card-text>
          </v-card>
        </div> -->
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
/*eslint-disable*/
import { get_material_list } from "@/mixins/GetMaterial";
import { ListProjectSites } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import MiniOverlayComp from "@/components/MiniOverlayComp.vue";

export default {
  components: { MiniOverlayComp },
  mixins: [get_material_list],
  data() {
    return {
      projectSiteItems: [],
      childItems: [],
      tree: [],
      showItem: 0,
      overlay: false,
      selectedLocation: null,
      icons: [
        "mdi-home",
        "mdi-account",
        "mdi-settings",
        "mdi-heart",
        "mdi-star",
        "mdi-email",
        "mdi-telephone",
        "mdi-car",
        "mdi-camera",
        "mdi-folder",
        "mdi-map",
        "mdi-cloud",
        "mdi-lock",
        "mdi-palette",
        "mdi-music-note",
      ],
      selectedMaterials: [],
    };
  },
  async mounted() {
    this.overlay = true;
    await this.fetch_stock();
  },
  methods: {
    getRandomColor() {
      // Generate a random hex color
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    getRandomIcon() {
      // Select a random icon from the list
      const randomIndex = Math.floor(Math.random() * this.icons.length);
      return this.icons[randomIndex];
    },

    async fetch_stock() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(graphqlOperation(ListProjectSites, {}));
        var response = JSON.parse(result.data.ListProjectSites);

        if (response.Status == "SUCCESS") {
          var responseData = response.Data;
          this.projectSiteItems = responseData;
          this.projectSiteItems.sort((a, b) =>
            a.location_name.localeCompare(b.location_name)
          );
          this.load_locations(0);
        } else {
        }
      } catch (error) {}
    },

    load_locations(index) {
      this.selectedLocation = this.projectSiteItems[index];
      this.selectedMaterials = this.projectSiteItems[index].stocks;
    },
  },
};
</script>

<style scoped>
.custom-outline {
  border-left: 2px solid #da8b64;
  border-right: 2px solid #da8b64;
  border-top: none;
  border-bottom: 2px solid #da8b64;
  border-radius: 8px;
  padding: 8px;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.active-item {
  background-color: rgb(245, 145, 87);
  color: #000;
}
.v-card {
  animation: fade-in 0.5s ease-in-out;
}
</style>