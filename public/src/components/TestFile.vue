<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-row no-gutters>
          <MiniOverlayComp :overlay="overlay" />
          <v-row>
            <div v-for="item in materialsItems" :key="item.material_id">
              <v-col cols="12" sm="6" md="4">
                <!-- This ensures 2 cards per row on small and medium screens -->
                <v-card class="mt-5">
                  <v-card-title>{{ item.name }}</v-card-title>
                  <v-card-text> </v-card-text>
                </v-card>
              </v-col>
            </div>
          </v-row>
          <v-col cols="6">
            <div v-for="item in materialsItems" :key="item.material_id">
              <v-card class="mt-5">
                <v-card-title>{{ item.name }}</v-card-title>
                <v-card-text>
                  <!-- <div v-for="child in materialsItems" :key="child.material_id">
                          {{ child.name }}
                        </div> -->
                </v-card-text>
              </v-card>
            </div>
            <!-- <v-list-item
                      v-for="item in materialsItems"
                      :style="{
                        backgroundColor: item.active ? '#E3F2FD' : '#FFEBEE',
                      }"
                      @click="onExpand(item)"
                      :key="item.material_id"
                    >
                      <v-list-item-content>
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item> -->

            <!-- <v-list rounded>
                <v-subheader>Materials</v-subheader>
                <v-list-item-group color="primary">
                  <v-list-item
                    v-for="(item, i) in materialsItems"
                    :style="{
                      backgroundColor: item.active ? '#E3F2FD' : '#FFEBEE',
                    }"
                    :key="i"
                  >
                    <v-list-item-content>
                      <v-list-item-title>{{ item.name }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list> -->
            <!-- <v-treeview
                rounded
                dense
                hoverable
                activatable
                :items="materialsItems"
                item-key="material_id"
                @update:open="onExpand"
              >
                <template #item="{ item }">
                  <v-list-item
                    v-bind:style="{
                      backgroundColor: 'blue',
  
                      padding: '10px',
                      borderRadius: '4px',
                    }"
                  >
                    <v-list-item-content>
                      <v-list-item-title>{{ item.text }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-treeview> -->
          </v-col>
          <v-col v-show="showItem == 1" cols="6">
            <v-card class="mt-5">
              <v-card-text>
                <div v-for="child in childItems" :key="child.id">
                  {{ child.name }}
                </div>
              </v-card-text>
              <!-- <v-list-item v-for="child in childItems" :key="child.id">
                    <v-list-item-content>
                      <v-list-item-title style="font-size: 13px">{{
                        child.title
                      }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item> -->
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
import { List_Material_Stock_Transactions } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import MiniOverlayComp from "@/components/MiniOverlayComp.vue";

export default {
  components: { MiniOverlayComp },
  mixins: [get_material_list],
  data() {
    return {
      materialsItems: [],
      childItems: [],
      tree: [],
      showItem: 0,
      overlay: false,
    };
  },
  async mounted() {
    this.overlay = true;
    await this.get_material_list();
    this.fetch_details();
  },
  methods: {
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

    async fetch_stock(expanded) {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(List_Material_Stock_Transactions, {
            input: {
              material_id: expanded,
            },
          })
        );
        var response = JSON.parse(result.data.List_Material_Stock_Transactions);
        if (response.Status == "SUCCESS") {
          var responseData = response.data;
          responseData.forEach((element) => {
            this.childItems.push({
              id: element.material_stock_id,
              name: `${element.location_name} has ${element.material_name} ( ${element.material_unit} )  ${element.material_quantity} left in stock`,
            });
          });
          this.showItem = 1;
          // const parentNode = this.materialsItems.find(
          //   (item) => item.material_id === expanded
          // );
          // parentNode.children = [];
          // if (parentNode) {
          //   array.forEach((element) => {

          //   });
          // }
          // array.forEach((element) => {
          //   this.materialsItems.children.push({
          //     id: element.material_stock_id,
          //     name:
          //       element.material_name + "20unit" + element.material_quantity,
          //   });
          // });

          // var data =
        } else {
        }
      } catch (error) {}
    },
  },
};
</script>
  
  <style scoped>
/* Slide in from top to bottom */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
}
.slide-fade-enter, .slide-fade-leave-to /* .slide-fade-leave-active in <2.1.8 */ {
  transform: translateY(-20px);
  opacity: 0;
}
</style>