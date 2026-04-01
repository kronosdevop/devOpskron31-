<template>
  <div>
    <v-card flat class="pa-4 overflow-y-auto" :height="windowHeight">
      <!-- Header with Back Button -->
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <div class="d-flex align-center">
          <v-icon class="mr-3" color="#DB4C77" size="24">mdi-cog</v-icon>
          <span class="text-h5">General Sales Settings</span>
        </div>
        <div class="d-flex align-center">
          <v-btn
            color="#DB4C77"
            @click="saveSettings"
            :loading="saving"
            class="mr-2"
          >
            Save
          </v-btn>
          <v-btn text @click="goBack" class="back-link" color="primary">
            <v-icon left>mdi-arrow-left</v-icon>
            Back
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-row>
          <!-- Left Column: Application Settings -->
          <v-col cols="12" md="6">
            <v-card class="pa-4" elevation="1">
              <v-card-title class="text-h6 mb-4">
                <v-icon class="mr-2" color="#DB4C77">mdi-application</v-icon>
                Application
              </v-card-title>

              <v-form>
                <!-- Currency Selection -->
                <div class="mb-4">
                  <label class="text-body-2 font-weight-medium mb-2 d-block"
                    >Currency</label
                  >
                  <v-select
                    v-model="selectedCurrency"
                    :items="currencyOptions"
                    variant="outlined"
                    density="compact"
                    placeholder="Select currency"
                    class="mb-2"
                  />
                </div>

                <!-- Decimal Places -->
                <div class="mb-4">
                  <label class="text-body-2 font-weight-medium mb-2 d-block"
                    >Amount Decimal Places</label
                  >
                  <v-select
                    v-model="decimalPlaces"
                    :items="decimalOptions"
                    variant="outlined"
                    density="compact"
                    placeholder="Select decimal places"
                  />
                </div>
              </v-form>
            </v-card>
          </v-col>

          <!-- Right Column: Entity Management -->
          <v-col cols="12" md="6">
            <v-card class="pa-4" elevation="1">
              <v-card-title
                class="text-h6 mb-4 d-flex align-center justify-space-between"
              >
                <div class="d-flex align-center">
                  <v-icon class="mr-2" color="#DB4C77">mdi-domain</v-icon>
                  Entity
                </div>
                <v-btn
                  @click="addEntity"
                  color="#DB4C77"
                  size="small"
                  prepend-icon="mdi-plus"
                  variant="elevated"
                >
                  Add Entity
                </v-btn>
              </v-card-title>

              <!-- Entity List -->
              <div v-if="entities.length > 0">
                <div
                  v-for="(entity, index) in entities"
                  :key="index"
                  class="entity-item mb-3"
                >
                  <v-card
                    class="pa-3"
                    elevation="0"
                    style="border: 1px solid #e0e0e0"
                  >
                    <div class="d-flex align-center justify-space-between">
                      <div class="d-flex align-center">
                        <v-radio-group
                          v-model="defaultEntityId"
                          class="mr-3"
                          density="compact" 
                          hide-details
                          @change="handleDefaultEntityChange(entity)"
                        >
                          <v-radio :value="entity.id" color="#DB4C77"></v-radio>
                        </v-radio-group>
                        <div class="d-flex align-center">
                          <v-img
                            v-if="entity.logo"
                            :src="entity.logo"
                            width="32"
                            height="32"
                            class="rounded-circle mr-3"
                            contain
                          />
                          <span class="text-body-1 font-weight-medium">{{
                            entity.name
                          }}</span>
                        </div>
                      </div>
                      <div class="d-flex align-center">
                        <span
                          v-if="entity.is_default"
                          class="text-caption text-grey-500 mr-2"
                          >DEFAULT</span
                        >
                        <v-btn
                          @click="editEntity(entity)"
                          icon="mdi-pencil"
                          size="small"
                          variant="text"
                          color="primary"
                        />
                      </div>
                    </div>
                  </v-card>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="text-center py-8">
                <v-icon size="48" color="grey lighten-1" class="mb-3"
                  >mdi-domain-off</v-icon
                >
                <div class="text-h6 grey--text mb-2">No Entities Found</div>
                <div class="text-body-2 grey--text">
                  Click "Add Entity" to create your first entity.
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Action Buttons -->
      </v-card-text>
    </v-card>

    <!-- Add Entity Dialog -->
    <AddEntityDialog 
      v-model="addEntityDialog" 
      @save="handleAddEntity"
      @successMsg="handleSuccessMsg"
      @errorMsg="handleErrorMsg"
    />

    <!-- Edit Entity Dialog -->
    <EditEntityDialog
      v-model="editEntityDialog"
      :editing-entity="editingEntity"
      @save="handleEditEntity"
      @successMsg="handleSuccessMsg"
      @errorMsg="handleErrorMsg"
    />
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import AddEntityDialog from "./AddEntityDialog.vue";
import EditEntityDialog from "./EditEntityDialog.vue";
import { get_organization_entity } from "@/mixins/GetOrganizationEntity.js";
import { get_sales_purchase_config } from "@/mixins/GetSalesPurchaseConfig.js";
import { API, graphqlOperation } from "aws-amplify";
import { organization_sales_purchase_config } from "@/graphql/mutations.js";
import SnackBar from "@/components/SnackBar.vue";
import { quotation_billing_entities } from "@/graphql/mutations.js";

export default {
  name: "SalesGeneral",

  components: {
    AddEntityDialog,
    EditEntityDialog,
    SnackBar,
  },

  mixins: [get_organization_entity, get_sales_purchase_config],

  data() {
    return {
      windowHeight: 0,
      saving: false,
      selectedCurrency: "None",
      decimalPlaces: 2,
      defaultEntity: null,
      defaultEntityId: null,
      entities: [],
      addEntityDialog: false,
      editEntityDialog: false,
      editingEntity: null,
      generalSettings: {},
      SnackBarComponent: {},
      currencyOptions: [
        { title: "None", value: "None" },
        { title: "Indian Rupee (₹)", value: "INR" },
        { title: "US Dollar (USD)", value: "USD" },
        { title: "Euro (EUR)", value: "EUR" },
        { title: "British Pound (GBP)", value: "GBP" },
        { title: "Japanese Yen (JPY)", value: "JPY" },
        { title: "Canadian Dollar (CAD)", value: "CAD" },
        { title: "Australian Dollar (AUD)", value: "AUD" },
        { title: "Swiss Franc (CHF)", value: "CHF" },
        { title: "Chinese Yuan (CNY)", value: "CNY" },
      ],

      decimalOptions: [
        { title: "0 decimal places", value: 0 },
        { title: "1 decimal place", value: 1 },
        { title: "2 decimal places", value: 2 },
        { title: "3 decimal places", value: 3 },
        { title: "4 decimal places", value: 4 },
      ],
    };
  },

  watch: {
    entities: {
      handler(newEntities) {
        const defaultEntity = newEntities.find(entity => entity.is_default);
        if (defaultEntity) {
          this.defaultEntityId = defaultEntity.id;
        } else if (newEntities.length > 0) {
          this.defaultEntityId = newEntities[0].id;
        }
      },
      immediate: true
    }
  },

  async mounted() {
    this.windowHeight = window.innerHeight - 180;
    // Load both organization entities and sales purchase config concurrently
    try {
      await Promise.all([
        this.loadOrganizationEntities(),
        this.loadSalesPurchaseConfig(),
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  },

  methods: {
    goBack() {
      this.$emit("backAction");
    },

    async loadSalesPurchaseConfig() {
      try {
        // Call the mixin method to get sales purchase config
        await this.get_sales_purchase_config();
        this.generalSettings = this.salesPurchaseConfig.find(
          (config) => config.config_type === "GENERAL"
        );
        // console.log(
        //   "Sales Purchase Config loaded in component:",
        //   this.generalSettings
        // );
        this.selectedCurrency = this.generalSettings.billing_currency;
        this.decimalPlaces = this.generalSettings.amount;
      } catch (error) {
        console.error("Error loading sales purchase config:", error);
      }
    },

    async loadOrganizationEntities() {
      try {
        // Call the mixin method to get organization entities
        await this.get_organization_entity();
        // console.log("Raw entitylist:", this.entitylist);
        // Transform the entitylist to match our component structure
        this.entities = this.entitylist.map((entity) => ({
          id: entity.entity_id,
          logo: entity.entity_logo || null,
          name: entity.entity_name,
          gstNo: entity.entity_gst || "",
          phoneNo: entity.entity_contact_no || "",
          emailId: entity.entity_owner_email || "",
          businessAddress: entity.entity_address || "",
          pincode: entity.entity_pincode || "",
          state: entity.entity_state || "",
          description: entity.entity_description || "",
          businessType: entity.entity_type || "",
          businessCategory: entity.enitity_category || "",
          businessDescription: entity.entity_description || "",
          signature: entity.entity_seal_signature || null,
          is_default: entity.is_default || false,
          entity_qr_code: entity.entity_qr_code || null,
        

        }));

        // console.log("Transformed entities:", this.entities);
      } catch (error) {
        console.error("Error loading organization entities:", error);
        // Fallback to sample data if API fails
      }
    },

    addEntity() {
      this.addEntityDialog = true;
    },

    editEntity(entity) {
      this.editingEntity = entity;
      // console.log(this.editingEntity)
      this.editEntityDialog = true;
    },

    handleAddEntity(entityData) {
      // Add new entity
      this.entities.push(entityData);

      // Set as default if it's the first entity
      if (this.entities.length === 1) {
        entityData.is_default = true;
      }

      // Refresh the entity list from API
      this.loadOrganizationEntities();
    },

    handleEditEntity(entityData) {
      // Update existing entity
      const index = this.entities.findIndex(
        (e) => e.id === this.editingEntity.id
      );
      if (index !== -1) {
        this.entities[index] = entityData;
      }

      this.editingEntity = null;

      // Refresh the entity list from API
      this.loadOrganizationEntities();
    },

    async saveSettings() {
      let config_settings = {
        billing_currency: this.selectedCurrency,
        amount: this.decimalPlaces,
      };
      this.saving = true;
      try {
        // Call the mixin method to save sales purchase config
        let result = await API.graphql(
          graphqlOperation(organization_sales_purchase_config, {
            input: {
              config_type: this.generalSettings.config_type,
              config_settings: JSON.stringify(config_settings),
              config_id: this.generalSettings.config_id,
            },
          })
        );
        // console.log(result);
        var response = JSON.parse(
          result.data.organization_sales_purchase_config
        );
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
        this.saving = false;
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    async handleDefaultEntityChange(entity) {
      // console.log("Changing default entity to:", entity);
      try {
        // Update the defaultEntityId immediately for UI responsiveness
        this.defaultEntityId = entity.id;
        
        // First, update all entities to set is_default to false
        this.entities.forEach(e => {
          e.is_default = false;
        });
        
        // Set the selected entity as default
        const selectedEntity = this.entities.find(e => e.id === entity.id);
        if (selectedEntity) {
          selectedEntity.is_default = true;
        }
        
        let result = await API.graphql(
          graphqlOperation(quotation_billing_entities, {
            input: {
              action_type: "UPDATE",
              entity_id: entity.id,
              is_default: true,
            },
          })
        );
        var response = JSON.parse(
          result.data.quotation_billing_entities
        );
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          // Refresh the entity list to get updated data
          await this.loadOrganizationEntities();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          // Revert the change if API call fails
          await this.loadOrganizationEntities();
        }
      } catch (error) {
        console.error("Error updating default entity:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Error updating default entity",
          timeout: 5000,
          Top: true,
        };
        // Revert the change if API call fails
        await this.loadOrganizationEntities();
      }
    },

    handleSuccessMsg(message) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
      // Refresh the entity list after successful creation
      this.loadOrganizationEntities();
    },

    handleErrorMsg(message) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
    },
  },
};
</script>

<style scoped>
.v-card {
  border-radius: 12px;
}

.v-card-title {
  color: #2c3e50;
  font-weight: 600;
}

.back-link {
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  padding: 8px 16px;
  border-radius: 8px;
}

.back-link:hover {
  background-color: rgba(156, 39, 176, 0.1);
  transform: translateX(-2px);
}

.back-link .v-icon {
  margin-right: 8px;
}

.entity-item {
  transition: all 0.2s ease;
}

.entity-item:hover {
  transform: translateY(-1px);
}

.entity-item .v-card {
  transition: all 0.2s ease;
}

.entity-item:hover .v-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
</style>
