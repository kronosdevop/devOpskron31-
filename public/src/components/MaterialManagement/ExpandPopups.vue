<template>
  <div>
    <!-- eslint-disable -->

    <v-card flat class="mx-auto">
      <v-card-text>
        <div v-show="consumedMaterials.length == 0">No Data available</div>
        <div v-show="consumedMaterials.length != 0">
          <v-simple-table class="custom-simple-table" dense>
            <template #default>
              <thead class="custom-header">
                <tr>
                  <th class="text-left">Cosumed On</th>
                  <th class="text-left">
                    Consumed Materials
                    {{ "(" + currentItem.material_unit + ")" }}
                  </th>
                  <th class="text-left">
                    Remaining Materials{{
                      "(" + currentItem.material_unit + ")"
                    }}
                  </th>
                  <th class="text-left">Consumed By</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in consumedMaterials"
                  :key="item.material_consumption_timestamp"
                >
                  <td>
                    {{ fetch_value(item.material_consumption_timestamp) }}
                  </td>
                  <td>{{ item.stock_consumed }}</td>
                  <td>{{ item.stock_after_consumption }}</td>
                  <td>{{ item.user_email_id }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
      </v-card-text>
    </v-card>

    <!-- <v-list dense flat>
      <v-list-item-group v-for="(value, key) in consumedMaterials" :key="key">
        <v-list-item>
          <v-card class="ma-1" max-width="700">
            <v-row no-gutters>
              <v-col cols="12">
                <div>
                  <b>Date</b> :
                  {{ fetch_value(value.material_consumption_timestamp) }}
                </div>
              </v-col>
              <v-col cols="12">
                <div>
                  <b>Consumed Material </b> :
                  {{ value.stock_consumed }}
                </div>
              </v-col>
              <v-col cols="12">
                <div>
                  <b>Left out</b> :
                  {{ value.stock_after_consumption }}
                </div>
              </v-col>
              
              <v-col cols="12">
                <div>
                  <b>Consumed by </b> :
                  {{ value.user_email_id }}
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-list-item>
      </v-list-item-group>
    </v-list> -->
  </div>
</template>
<script>
/*eslint-disable*/
import { API, graphqlOperation } from "aws-amplify";
import { format_Date } from "@/JsonFiles/DateFormate.js";

import { List_Material_Stock_Transactions } from "@/graphql/queries.js";
export default {
  props: {
    currentItem: Object,
  },
  data() {
    return {
      consumedMaterials: [],
    };
  },
  created() {
    this.consumedMaterials = [];
    this.fetch_consumed();
  },
  methods: {
    fetch_value(val) {
      return format_Date(val);
    },

    async fetch_consumed() {
      try {
        let result = await API.graphql(
          graphqlOperation(List_Material_Stock_Transactions, {
            input: {
              material_stock_id: this.currentItem.material_stock_id,
            },
          })
        );

        var response = JSON.parse(result.data.List_Material_Stock_Transactions);
        if (response.Status == "SUCCESS") {
          this.consumedMaterials = response.data;

          //   console.log(response);
        } else {
          this.consumedMaterials = [];
        }
      } catch (error) {
        this.consumedMaterials = [];
      }
    },
  },
};
</script>
<style scoped>
.custom-simple-table .custom-header {
  background-color: rgb(223, 218, 218);
  color: black !important;
  font-size: 11px !important; /* Font size */
  font-weight: bold;
}
.custom-simple-table .v-simple-table th {
  padding: 8px 16px;
  text-align: left;
}
.custom-simple-table .v-simple-table td {
  padding: 8px 16px;
}
</style>