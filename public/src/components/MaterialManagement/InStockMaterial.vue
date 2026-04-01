<template>
  <div>
    <v-card flat >
      <v-card-text>
        <v-row no-gutters>
          <!-- <v-col
            cols="12"
            sm="4"
            md="4"
            lg="4"
            v-for="(item, i) in materialsItems"
            :key="i"
          >
            <v-card class="ma-2">
              <v-card-title style="font-size: 15px" class="primary--text">
                :style="{ color: getRandomColor() }"
                <v-icon :color="getRandomColor()" class="mr-2">{{ getRandomIcon() }}</v-icon>
                <v-icon dense color="primary" class="mr-2">mdi-nut</v-icon>
                <span class="mt-n1">{{ item.material_name }} </span>
              </v-card-title>
              <v-card-text>
                <v-list dense>
                  <v-list-item v-for="(stock, i) in item.locations" :key="i">
                    <v-list-item-icon>
                      <v-icon dense x-small color="grey">mdi-circle</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="" style="font-size: 13px">
                        <strong>{{ stock.location_name }}</strong>
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
          </v-col> -->
          <v-col cols="5">
            <v-card flat dense>
              <v-list
                dense
                :style="{ height: windowHeight + 'px', overflowY: 'auto' }"
              >
                <transition-group name="fade-slide" tag="div" class="pa-2">
                  <v-list-item
                    v-for="(item, i) in materialsItems"
                    :key="item.material_name + i"
                    class="my-2 custom-outline"
                    @click="load_locations(i)"
                    :class="{
                      'active-item':
                        selectedMaterial &&
                        selectedMaterial.material_name === item.material_name,
                    }"
                    :style="{
                      animation: `slide-in 0.5s ease ${i * 0.1}s forwards`,
                    }"
                  >
                    <v-list-item-content>
                      <v-list-item-title
                        v-text="item.material_name"
                      ></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </transition-group>
              </v-list>
            </v-card>
          </v-col>
          <v-col cols="7">
            <v-card
              class="ml-5"
              v-if="selectedMaterial"
        
            >
              <v-subheader v-if="selectedMaterial">
                <strong>{{ selectedMaterial.material_name }}</strong>
              </v-subheader>
              <v-card-text>
                <v-list dense>
                  <v-list-item v-for="(stock, i) in selectedLocations" :key="i">
                    <v-list-item-icon>
                      <v-icon dense x-small color="grey">mdi-circle</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title class="" style="font-size: 13px">
                        <strong>{{ stock.location_name }}</strong>
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
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
/*eslint-disable*/
import { get_material_list } from "@/mixins/GetMaterial";
import { List_material_with_locations } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import MiniOverlayComp from "@/components/MiniOverlayComp.vue";

export default {
  components: { MiniOverlayComp },
  mixins: [get_material_list],
  data() {
    return {
      materialsItems: [],
      selectedLocations: [],
      selectedMaterial: null,
      childItems: [],
      tree: [],
      showItem: 0,
      windowHeight: 0,
      overlay: false,
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
    };
  },
  async mounted() {
    this.overlay = true;
    this.materialsItems = [];
    this.materialsLocations = [];
    this.windowHeight = window.innerHeight - 250;
    await this.fetch_stock();
    // this.fetch_details();
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
    fetch_details() {
      this.materialList.forEach((element) => {
        this.materialsItems.push({
          name: element.material_name,
          material_id: element.material_id,
          active: false,
          // children: [{ id: "", name: "" }],
        });
      });
      this.overlay = false;
    },

    async onExpand(item) {
      this.fetch_stock(item.material_id);
      // if (expanded.length > 0) {
      //   const expandedNodeId = expanded[expanded.length - 1];
      //   this.fetch_stock(expandedNodeId);
      // } else {
      // }
    },

    async fetch_stock() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(List_material_with_locations, {
            // input: {
            //   material_id: "ALL",
            //   location_id: "ALL",
            // },
          })
        );
        var response = JSON.parse(result.data.List_material_with_locations);

        if (response.Status == "SUCCESS") {
          var responseData = response.Data;
          responseData.forEach((element) => {
            if (element.locations.length > 0) {
              this.materialsItems.push(element);
            }
          });
          this.materialsItems.sort((a, b) =>
            a.material_name.localeCompare(b.material_name)
          );
          this.load_locations(0);
          // console.log(this.materialsItems);
        } else {
        }
      } catch (error) {}
    },
    load_locations(index) {
      this.selectedMaterial = this.materialsItems[index];
      this.selectedLocations = this.materialsItems[index].locations;
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
    transform: translateY(-30px); /* Start slightly above */
  }
  to {
    opacity: 1;
    transform: translateY(0); /* End at original position */
  }
}
.active-item {
  background-color: rgb(245, 145, 87); /* Light yellow background */
  color: #000; /* Black text color for visibility */
}
.v-card {
  animation: fade-in 0.5s ease-in-out;
}
</style>