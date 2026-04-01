<template>
  <div>
    <!--  eslint-disable 
 -->
    <v-card flat >
      <v-toolbar flat >
        <v-toolbar-title> Add Stock </v-toolbar-title>
        <v-spacer />
        <v-btn dark class="text-capitalize cardCss ml-2" @click="back_call()">
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>

      <!-- Select Location -->
      <v-card-text>
        <v-select
          variant="outlined"
          density="compact"
          label="Location*"
          item-title="location_name"
          item-value="location_id"
          v-model="stockLocation"
          :items="filteredLocationItems"
          style="max-width: 250px"
          return-object
          @update:model-value="stockItems.length > 0 ? (locationConfirm = true) : ''"
        />
        <v-row class="mt-2">
          <v-col v-for="(item, index) in stockItems" :key="index" cols="12">
            <v-card variant="outlined" flat >
              <v-card-text>
                <v-row>
                  <v-col cols="10">
                    <v-row>
                      <v-col cols="3">
                        <div>
                          <strong>Product:</strong>
                          {{ fetch_name(item.sub_category_id) }}
                        </div>
                      </v-col>
                      <v-col cols="3">
                        <div>
                          <strong>Quantity:</strong>
                          {{ item.sub_category_quantity }}
                        </div>
                      </v-col>
                      <v-col cols="3">
                        <div>
                          <strong>Units:</strong>
                          {{ item.sub_category_unit_name }}
                        </div>
                      </v-col>
                      <v-col cols="3">
                        <div>
                          <strong>Amount:</strong> {{ item.amount_paid }}
                        </div>
                      </v-col>
                      <v-col cols="3">
                        <div>
                          <strong>Bill Details:</strong>
                          {{ item.bill_details || "N/A" }}
                        </div>
                      </v-col>
                      <v-col cols="3">
                        <div>
                          <strong>Comments:</strong>
                          {{ item.sub_category_consumption_comments || "N/A" }}
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="2">
                    <v-icon large @click="open_delete(index)" color="red"
                      >mdi-delete</v-icon
                    >
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <!-- Select Product and Quantity -->
        <v-card
          variant="outlined"
          flat
          
          class="mt-2"
        >
          <v-card-text>
            <v-form ref="form">
              <v-row>
                <v-col cols="3">
                  <v-select
                    variant="outlined"
                    density="compact"
                    label="Product*"
                    :rules="[(v) => !!v || 'required ']"
                    item-title="sub_category_name"
                    item-value="sub_category_id"
                    :items="filteredSubMasterList"
                    v-model="stockProduct"
                    return-object
                    @update:model-value="updateUnits()"
                  />
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    density="compact"
                    variant="outlined"
                    v-model="stockQuantity"
                    label="Quantity*"
                    :rules="[(v) => !!v || 'required ']"
                    @keypress="is_number($event)"
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-select
                    variant="outlined"
                    density="compact"
                    label="Units*"
                    item-title="material_unit_name"
                    item-value="material_unit_id"
                    :items="updatedUnits"
                    v-model="unitstype"
                    return-object
                    :rules="[(v) => !!v || 'required ']"
                  />
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    density="compact"
                    variant="outlined"
                    v-model="amountPaid"
                    label="Amount Paid"
                    @keypress="is_number($event)"
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-text-field
                    density="compact"
                    variant="outlined"
                    v-model="billDetails"
                    label="Bill Details"
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <v-textarea
                    variant="outlined"
                    density="compact"
                    v-model="comments"
                    label="Comments"
                    auto-grow
                    rows="1"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-form>
            <!-- Add Button -->
            <v-card-actions class="justify-start">
              <v-btn
                dark
                class="text-capitalize cardCss ml-2"
                size="small"
                @click="additems"
              >
                Add
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
        <v-card-actions class="justify-center" v-if="stockItems.length > 0">
          <v-btn
            dark
            class="text-capitalize cardCss"
            :loading="loading"
            @click="create_StockInvertory"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
    <v-dialog
      :model-value="locationConfirm"
      @update:model-value="$emit('update:locationConfirm', $event)"
      persistent
      width="500"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-card-text class="pa-5"
          >Changing the location will clear the stock records in the list. Would
          you like to change the location?
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            variant="flat"
            @click="
              locationConfirm = false;
              stockItems = [];
            "
            dark
            class="cardCss mr-2"
          >
            Yes
          </v-btn>
          <v-btn
            variant="flat"
            @click="locationConfirm = false"
            dark
            class="cardCss"
          >
            No
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <!-- Loop through added items and display them -->
  </div>
</template>
  
  <script>
  /* eslint-disable */

import SnackBar from "@/components/SnackBar.vue";
import { add_update_product_to_stock } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_sub_categories } from "@/mixins/GetMasterSubcategories.js";
import { get_location_details } from "@/mixins/GetLocations.js";
import { get_material_unit } from "@/mixins/GetMaterialUnit.js";
export default {
  mixins: [get_location_details, get_sub_categories, get_material_unit],
  components: {
    SnackBar,
  },
  data() {
    return {
      stockLocation: "",
      stockQuantity: "",
      stockProduct: "",
      billDetails: "",
      comments: "",
      amountPaid: "",
      unitstype: "",
      updatedUnits: [],
      LocationItems: [],
      stockItems: [],
      subMasterList: [],
      SnackBarComponent: {},
      loading: false,
      locationConfirm: false,
    };
  },
  computed: {
    filteredSubMasterList() {
      return this.subMasterList.filter(
        (item) => item.sub_category_type === "PRODUCT"
      );
    },

    filteredLocationItems() {
      return this.LocationItems.filter(
        (item) =>
          item.location_type != "SCAN_ANYWHERE" &&
          (item.is_product_inventory_space == null ||
            item.is_product_inventory_space == true)
      );
    },
  },
  async mounted() {
    this.stockLocation = "";
    await this.get_location_details();
    this.LocationItems = this.locationList;
    await this.get_sub_categories();
    this.subMasterList = this.MasterSubCategories;
    await this.get_material_unit();
  },
  methods: {
    async create_StockInvertory() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(add_update_product_to_stock, {
            input: {
              products: this.stockItems,
            },
          })
        );
        this.loading = false;
        var response = JSON.parse(result.data.add_update_product_to_stock);
        if (response.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.$router.push("/Inventory");
          this.stockItems = [];
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        console.error("GraphQL Error:", error);
        this.loading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    open_delete(idx) {
      this.stockItems.splice(idx, 1);
    },
    fetch_name(item) {
      let name = "";
      this.filteredSubMasterList.forEach((element) => {
        if (element.sub_category_id == item) {
          name = element.sub_category_name;
        }
      });
      return name;
    },
    updateUnits() {
      this.unitstype = "";
      if (!this.stockProduct) return;
      
      let unitslist = this.unitmaterials;
      this.updatedUnits = unitslist.filter((obj) =>
        this.stockProduct.sub_category_unit.includes(obj.material_unit_id)
      );
    },
    is_number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },
    back_call() {
      this.$router.push("Inventory");
    },
    async additems() {
      if (this.stockLocation) {
        const { valid } = await this.$refs.form.validate();
        if (valid) {
          if (!this.stockProduct || !this.unitstype) {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "Please select both Product and Units",
              timeout: 5000,
              Top: true,
            };
            return;
          }
          
          // Push the new item into the stockItems array
          const duplicate = this.stockItems.find(
            (item) =>
              item.sub_category_id === this.stockProduct.sub_category_id &&
              item.sub_category_unit_id === this.unitstype.material_unit_id
          );
          if (duplicate) {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "Stock with the same unit exists.",
              timeout: 5000,
              Top: true,
            };

            return;
          }

          this.stockItems.push({
            sub_category_id: this.stockProduct.sub_category_id,
            sub_category_unit_id: this.unitstype.material_unit_id,
            sub_category_quantity: Number(this.stockQuantity),
            location_id: this.stockLocation.location_id,
            location_name: this.stockLocation.location_name,
            amount_paid: Number(this.amountPaid) || 0,
            bill_details: this.billDetails == null ? "" : this.billDetails,
            sub_category_consumption_comments:
              this.comments == null ? "" : this.comments,
            sub_category_unit_name: this.unitstype.material_unit_name,
          });

          // Optionally clear the inputs after adding the item
          this.$refs.form.reset();
          this.$refs.form.resetValidation();
        }
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Select Location and Please fill in all fields.",
          timeout: 5000,
          Top: true,
        };
      }
    },
  },
};
</script>
  
  <style scoped>
.cardCss {
  font-weight: bold;
}
</style>
  