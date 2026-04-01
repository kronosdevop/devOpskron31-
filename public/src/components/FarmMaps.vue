<template>
  <div>
    <v-card flat>
      <v-card-text>
        <v-row no-gutters>
          <MiniOverlayComp :overlay="overlay" />

          <v-col cols="5">
            <v-list shaped>
              <v-list-group
                v-for="item in materialsItems"
                :key="item.material_id"
                v-model="item.active"
                no-action
              >
                <template #activator>
                  <v-list-item-content
                    :style="{
                      backgroundColor: item.active ? '#E3F2FD' : '#FFEBEE',
                    }"
                    @click="onExpand(item)"
                  >
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                  </v-list-item-content>
                </template>

                <v-list-item v-for="child in item.items" :key="child.id">
                  <v-list-item-content>
                    <v-list-item-title style="font-size: 13px">{{
                      child.title
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item v-if="item.loading" key="loading">
                  <v-list-item-content class="text-center">
                    <v-progress-circular
                      indeterminate
                      color="primary"
                      size="30"
                      width="4"
                    ></v-progress-circular>
                  </v-list-item-content>
                </v-list-item>
              </v-list-group>
            </v-list>
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
          text: element.material_name,
          material_id: element.material_id,
          active: false,
          items: [],
          loading: false, // Track loading state for each material group
        });
      });
      this.overlay = false;
    },

    async onExpand(item) {
      // this.fetch_stock(item.material_id);
    },

    async fetch_stock(expanded) {
      // Find the material item and set loading to true
      const materialItem = this.materialsItems.find(
        (item) => item.material_id === expanded
      );
      materialItem.loading = true;

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
          const array = response.data;
          const parentNode = this.materialsItems.find(
            (item) => item.material_id === expanded
          );
          parentNode.items = [];
          array.forEach((element) => {
            parentNode.items.push({
              id: element.material_stock_id,
              title: `${element.location_name} has ${element.material_name} (${element.material_unit}) ${element.material_quantity} left in stock`,
            });
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        // Set loading to false once data is fetched
        const materialItem = this.materialsItems.find(
          (item) => item.material_id === expanded
        );
        materialItem.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Transition effect for child items and progress circular */
.fade-item {
  opacity: 0;
  transform: translateX(-20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-to,
.fade-leave {
  opacity: 1;
  transform: translateX(0);
}

.text-center {
  text-align: center;
}
</style>