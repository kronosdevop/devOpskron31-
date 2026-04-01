<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="editTerritoryDialogue"
      @update:model-value="editTerritoryDialogue = $event"
      persistent
      max-width="900"
      transition="dialog-bottom-transition"
      scrollable
    >
      <v-card>
        <v-toolbar elevation="0" dark density="compact" class="navBar">
          <v-toolbar-title class="ml-2">
            <div class="custom-title">Edit Territory</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="mr-3" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6" style="max-height: 70vh; overflow-y: auto;">
          <v-form ref="form">
            <v-row no-gutters class="mt-4">
              <v-col cols="6" class="pr-2">
                <v-text-field
                  v-model="territoryName"
                  label=" Name*"
                  :rules="[(v) => !!v || 'required ']"
                  class=""
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>

              <v-col cols="6" class="pl-2">
                <v-text-field
                  v-model="territoryDescription"
                  label="Description"
                  class=""
                  density="compact"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="mt-2">
                <v-autocomplete
                  v-model="terriotoryManager"
                  label="Territory Manager"
                  :rules="[(v) => !!v || 'required ']"
                  density="compact"
                  variant="outlined"
                  item-text="title"
                  item-value="user_id"
                  :items="userArray"
                  v-model:search="searchF"
                  hide-no-data
                  return-object
                  placeholder="Min 3 Character"
                  @update:model-value="change_manager()"
                >
                </v-autocomplete>
              </v-col>

              <!-- Pincode Section -->
              <v-col cols="12" class="mt-4">
                <div class="section-title mb-3">
                  <v-icon class="mr-2">mdi-map-marker</v-icon>
                  <b>Pincode Details</b>
                </div>
                <v-alert
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mb-3"
                >
                  <template v-slot:prepend>
                    <v-icon>mdi-information</v-icon>
                  </template>
                  Search by pincode to fetch the state and district fields.
                </v-alert>
                <v-row no-gutters>
                  <v-col cols="3" class="pr-2">
                    <v-text-field
                      density="compact"
                      v-model="locationPincode"
                      label="Location Pincode"
                      maxlength="6"
                      @keypress="is_Number($event)"
                      variant="outlined"
                      prepend-inner-icon="mdi-map-marker"
                      clearable
                    ></v-text-field>
                  </v-col>
                  <v-col cols="2" class="px-1">
                    <v-btn
                      dark
                      small
                      :loading="loading1"
                      :disabled="!locationPincode || locationPincode.length !== 6"
                      class="pa-0 white--text cardCss"
                      @click="fetchPinData()"
                      style="height: 40px; margin-top: 4px; width: 100%;"
                    >
                      Go
                    </v-btn>
                  </v-col>
                  <v-col cols="3" class="px-1">
                    <v-text-field
                      v-model="locationState"
                      label="State"
                      density="compact"
                      variant="outlined"
                      prepend-inner-icon="mdi-city"
                      clearable
                    ></v-text-field>
                  </v-col>
                  <v-col cols="4" class="pl-2">
                    <v-text-field
                      v-model="locationDistrict"
                      label="District"
                      density="compact"
                      variant="outlined"
                      prepend-inner-icon="mdi-map"
                      clearable
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row no-gutters class="mt-2">
                  <v-col cols="12">
                    <v-btn
                      dark
                      small
                      :disabled="!locationPincode || !locationState || !locationDistrict"
                      class="text-capitalize cardCss"
                      @click="addPincodeToList()"
                    >
                      {{ editingPincodeIndex >= 0 ? 'Update Pincode' : 'Add Pincode' }}
                    </v-btn>
                    <v-btn
                      v-if="editingPincodeIndex >= 0"
                      text
                      small
                      class="ml-2"
                      @click="resetPincodeFields()"
                    >
                      Cancel
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>

              <!-- Pincode List Table -->
              <v-col cols="12" class="mt-4" v-if="pincodeList.length > 0">
                <div class="section-title mb-3">
                  <v-icon class="mr-2">mdi-table</v-icon>
                  <b>Pincode List</b>
                </div>
                <v-table density="compact" class="elevation-1">
                  <thead>
                    <tr>
                      <th class="text-left">Pincode</th>
                      <th class="text-left">State</th>
                      <th class="text-left">District</th>
                      <th class="text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in pincodeList" :key="index">
                      <td>{{ item.pincode }}</td>
                      <td>{{ item.state }}</td>
                      <td>{{ item.district }}</td>
                      <td>
                        <v-icon
                          color="primaryColor"
                          class="mr-2"
                          small
                          @click="editPincode(index)"
                          >mdi-pencil</v-icon
                        >
                        <v-icon
                          color="red"
                          small
                          @click="removePincode(index)"
                          >mdi-delete</v-icon
                        >
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="validate_data()"
            dark
            class="text-capitalize cardCss button-corner text-white"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
  <script>
/* eslint-disable */
import { create_list_edit_territories } from "@/graphql/mutations.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { API, graphqlOperation } from "aws-amplify";

export default {
  props: {
    editTerritoryDialogue: Boolean,
    rowInfo: Object,
  },
  mixins: [get_all_org_users],

  data() {
    return {
      loading: false,
      loading1: false,
      territoryName: "",
      territoryCity: "",
      territoryDescription: "",
      terriotoryManager: "",
      changedManager: false,
      userArray: [],
      searchF: "",
      countryData: "India", // Default to India, not shown in UI
      locationPincode: "",
      locationState: "",
      locationDistrict: "",
      districtItems: [],
      stateItems: [],
      pincodeList: [],
      editingPincodeIndex: -1,
      isInitializing: false,
    };
  },
  watch: {
    editTerritoryDialogue: {
      async handler() {
        if (this.editTerritoryDialogue == true) {
          this.isInitializing = true;
          this.$store.commit("Setnamesearch", "");
          await this.get_all_org_users();
          this.changedManager = false;
          this.territoryName = this.rowInfo.territory_name;
          this.territoryDescription = this.rowInfo.territory_description;
          this.terriotoryManager = this.rowInfo.territory_head;
          await this.fetch_details();
          // Wait a tick to ensure all updates are done
          this.$nextTick(() => {
            this.isInitializing = false;
          });
        }
      },
      immediate: true,
    },
    terriotoryManager: {
      handler(newValue, oldValue) {
        // Skip change detection during initialization or if dialog is closed
        if (this.isInitializing || !this.editTerritoryDialogue) {
          return;
        }
        // Only trigger if value actually changed
        if (newValue !== oldValue) {
          this.change_manager(newValue);
        }
      },
      deep: true,
    },
  },
  methods: {
    fetch_details() {
      // Clear the array first to prevent duplicates
      this.userArray = [];
      const seenUserIds = new Set();
      this.orgUsers.forEach((element) => {
        if (
          element.user_status == "ACTIVE" &&
          !seenUserIds.has(element.user_id)
        ) {
          seenUserIds.add(element.user_id);
          this.userArray.push({
            title: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });

      // Set the selected manager in the correct format
      if (this.rowInfo.territory_head) {
        const selectedManager = this.userArray.find(
          (user) => user.user_id === this.rowInfo.territory_head
        );
        if (selectedManager) {
          this.terriotoryManager = selectedManager;
        }
      }
// console.log(this.rowInfo.territory_states);
      // Load existing pincode list if available
      if (this.rowInfo.territory_states) {
        try {
          this.pincodeList = this.rowInfo.territory_states;
        } catch (e) {
          console.error("Error parsing territory_states:", e);
          this.pincodeList = [];
        }
      }
    },

    close_dialog() {
      this.$emit("clicked", 0);
      this.resetPincodeFields();
      this.pincodeList = [];
    },

    resetPincodeFields() {
      this.locationPincode = "";
      this.locationState = "";
      this.locationDistrict = "";
      this.districtItems = [];
      this.stateItems = [];
      this.editingPincodeIndex = -1;
    },

    is_Number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        evt.preventDefault();
      } else {
        return true;
      }
    },

    async fetchPinData() {
      if (!this.locationPincode || this.locationPincode.length !== 6) {
        this.$emit(
          "errorMsg",
          "Please enter a valid 6-digit Postal Index Number"
        );
        return;
      }

      this.stateItems = [];
      this.districtItems = [];
      this.loading1 = true;

      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${this.locationPincode}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data[0] || data[0].Status !== "Success") {
          throw new Error("Invalid pincode or no data found");
        }

        var masterArray = data[0].PostOffice;

        if (!masterArray || masterArray.length === 0) {
          throw new Error("No post office data found for this pincode");
        }

        // Deduplicate districts and states
        this.districtItems = [
          ...new Set(masterArray.map((element) => element.District)),
        ];
        this.stateItems = [
          ...new Set(masterArray.map((element) => element.State)),
        ];
        this.locationDistrict = data[0].PostOffice[0].District;
        this.locationState = data[0].PostOffice[0].State;
      } catch (err) {
        console.error("Error fetching pincode data:", err);
        this.$emit("errorMsg", err.message || "Failed to fetch pincode data");
        this.locationPincode = "";
        this.locationDistrict = "";
        this.locationState = "";
      } finally {
        this.loading1 = false;
      }
    },

    addPincodeToList() {
      if (!this.locationPincode || !this.locationState || !this.locationDistrict) {
        this.$emit("errorMsg", "Please fill all pincode fields");
        return;
      }

      // Check if pincode already exists
      const exists = this.pincodeList.some(
        (item) => item.pincode === this.locationPincode
      );

      if (exists && this.editingPincodeIndex === -1) {
        this.$emit("errorMsg", "This pincode is already in the list");
        return;
      }

      const pincodeData = {
        pincode: this.locationPincode,
        state: this.locationState,
        district: this.locationDistrict,
      };

      if (this.editingPincodeIndex >= 0) {
        // Update existing pincode
        this.pincodeList[this.editingPincodeIndex] = pincodeData;
        this.editingPincodeIndex = -1;
      } else {
        // Add new pincode
        this.pincodeList.push(pincodeData);
      }

      this.resetPincodeFields();
    },

    editPincode(index) {
      const item = this.pincodeList[index];
      this.locationPincode = item.pincode;
      this.locationState = item.state;
      this.locationDistrict = item.district;
      this.editingPincodeIndex = index;
    },

    removePincode(index) {
      this.pincodeList.splice(index, 1);
      if (this.editingPincodeIndex === index) {
        this.resetPincodeFields();
      }
    },

    change_manager(newValue) {
      // Compare the new value with the original to detect actual changes
      if (newValue && this.rowInfo.territory_head) {
        const newUserId = newValue.user_id || newValue;
        const oldUserId = this.rowInfo.territory_head;
        this.changedManager = newUserId !== oldUserId;
      } else if (newValue) {
        // If there's a new value but no old value, it's a change
        this.changedManager = true;
      } else {
        // If value is cleared, check if there was an original value
        this.changedManager = !!this.rowInfo.territory_head;
      }
    },

    validate_data() {
      if (this.$refs.form.validate()) {
        this.edit_mutation();
      }
    },

    async edit_mutation() {
      var data = this.$store.getters.GetUserObj;

      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(create_list_edit_territories, {
            input: {
              organization_id: data.organization.organization_id,
              action_type: "UPDATE",
              territory_id: this.rowInfo.territory_id,
              territory_name: this.territoryName,
              territory_description: this.territoryDescription,
              territory_head:
                this.changedManager == true && this.terriotoryManager
                  ? (this.terriotoryManager.user_id || this.terriotoryManager)
                  : this.rowInfo.territory_head,
              territory_head_name:
                this.changedManager == true && this.terriotoryManager
                  ? (this.terriotoryManager.title || this.terriotoryManager)
                  : this.rowInfo.territory_head_name,
              territory_states: this.pincodeList.length > 0 ? JSON.stringify(this.pincodeList) : null,
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_list_edit_territories);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>

<style scoped>
.section-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #db4c77;
  margin-bottom: 12px;
  position: relative;
  padding-left: 8px;
}

.section-title b {
  font-weight: 600;
}
</style>