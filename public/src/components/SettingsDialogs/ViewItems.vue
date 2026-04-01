<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="ViewProductDialog" @update:model-value="$emit('update:ViewProductDialog', $event)"
      persistent
      max-width="800"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar dense flat>
          <v-toolbar-title>View Product Details</v-toolbar-title>
          <v-spacer />
          <v-btn
            small
            dark
            class="text-capitalize cardCss ml-2 mr-4"
            @click="cancelAction"
          >
            Cancel
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-card outlined class="mb-4">
            <v-col md="6" class="">
              <div>
                <strong>Item Type: </strong>
                {{ rowInfo.sub_category_type || "N/A" }}
              </div>
            </v-col>
          </v-card>
          <div v-if="rowInfo.sub_category_type == 'PRODUCT'">
            <v-card outlined class="mb-4">
              <v-card-title class="subtitle-1 font-weight-bold">
                <v-icon left color="secondaryColor">mdi-office-building</v-icon>
                Basic Information
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-row dense>
                  <v-col md="6" class="">
                    <div>
                      <strong>Name: </strong>
                      {{ rowInfo.sub_category_name || "N/A" }}
                    </div>
                  </v-col>
                  <v-col md="6" class="">
                    <div>
                      <strong>Code / SKU: </strong>
                      {{ rowInfo.sub_category_Sku || "N/A" }}
                    </div>
                  </v-col>
                  <v-col md="6" class="">
                    <div>
                      <strong>Category: </strong>
                      {{ rowInfo.category_name || "N/A" }}
                    </div>
                  </v-col>
                  <v-col md="6" class="">
                    <div>
                      <strong>Unit of Measure: </strong>
                      {{ rowInfo.firm_type || "N/A" }}
                    </div>
                  </v-col>
                  <v-col md="6" class="">
                    <div>
                      <strong>Brand: </strong>
                      {{ rowInfo.brand_name || "N/A" }}
                    </div>
                  </v-col>
                  <v-col md="6" class="">
                    <div>
                      <strong>Description: </strong>
                      {{ rowInfo.sub_category_description || "N/A" }}
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
            <!-- Address Details -->
            <v-card outlined class="mb-4">
              <v-card-title class="subtitle-1 font-weight-bold">
                <v-icon left color="secondaryColor">mdi-scale-balance</v-icon>
                Pricing & Tax
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-row dense>
                  <v-col md="6" class="">
                    <div>
                      <strong>MRP / Retail Price: </strong>
                      {{ rowInfo.sub_category_retail_price || "N/A" }}
                    </div>
                  </v-col>
                  <v-col md="6" class="">
                    <div>
                      <strong>Selling Price: </strong>
                      {{ rowInfo.sub_category_selling_price || "N/A" }}
                    </div>
                  </v-col>
                  <v-col md="6" class="">
                    <div>
                      <strong>Currency: </strong>
                      {{ rowInfo.currency || "N/A" }}
                    </div>
                  </v-col>
                  <v-col md="6" class="">
                    <div>
                      <strong>Tax Rate (%): </strong>
                      {{ rowInfo.sub_category_tax || "N/A" }}
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>
          <div v-if="rowInfo.sub_category_type == 'SERVICE'">
            <v-card outlined class="mb-4">
              <v-card-title class="subtitle-1 font-weight-bold">
                <v-icon left color="secondaryColor">mdi-office-building</v-icon>
                Basic Information
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-row dense>
                  <v-col md="6" class="">
                    <div>
                      <strong>Name: </strong>
                      {{ rowInfo.sub_category_name || "N/A" }}
                    </div>
                  </v-col>
                  <v-col md="6" class="">
                    <div>
                      <strong>Code: </strong>
                      {{ rowInfo.sub_category_Sku || "N/A" }}
                    </div>
                  </v-col>
                  <v-col md="6" class="">
                    <div>
                      <strong>Cost: </strong>
                      {{ rowInfo.sub_category_retail_price || "N/A" }}
                    </div>
                  </v-col>
                  <v-col md="6" class="">
                    <div>
                      <strong>Description: </strong>
                      {{ rowInfo.sub_category_description || "N/A" }}
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    ViewProductDialog: Boolean,
    rowInfo: Object,
  },

  methods: {
    cancelAction() {
      this.$emit("clicked", 0);
    },
  },
};
</script>

<style>
</style>