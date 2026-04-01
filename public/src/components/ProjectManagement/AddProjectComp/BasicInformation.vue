<template>
  <div>
    <v-card>
      <v-card-actions class="mt-2 justify-end">
        <v-btn
          variant="flat"
          @click="validate_request()"
          dark
          class="cardCss text-capitalize button-corner ml-2"
        >
          Next
        </v-btn>
      </v-card-actions>
      <v-card-text>
        <v-form ref="form">
          <v-row no-gutters class="mt-3">
            <v-col cols="6">
              <v-textarea
                density="compact"
                v-model="projectName"
                label="Project Name*"
                :rules="[(v) => !!v || 'required ']"
                class=""
                rows="0"
                maxlength="30"
                auto-grow
                variant="outlined"
              ></v-textarea>
            </v-col>
            <v-col cols="6">
              <v-textarea
                density="compact"
                v-model="projectDescription"
                label="Project Description*"
                :rules="[
                  (v) =>
                    (v !== null && v !== undefined && v.length >= 20) ||
                    'Minimum length is 20 characters',
                  (v) => !!v || 'Required',
                ]"
                class="ml-2"
                rows="0"
                minlength="20"
                maxlength="500"
                auto-grow
                variant="outlined"
              ></v-textarea>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="displayFromDate"
                variant="outlined"
                density="compact"
                :rules="[(v) => !!v || 'Required ']"
                label="Proposed Start Date*"
                readonly
                @click="fromDateDialog = true"
              >
                <template #append-inner>
                  <v-icon @click="fromDateDialog = true">mdi-calendar</v-icon>
                </template>
              </v-text-field>
              <v-dialog v-model="fromDateDialog" persistent max-width="325">
                <v-card>
                  <v-date-picker
                    v-model="tempFromDate"
                    color="primary"
                  ></v-date-picker>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" color="primary" @click="fromDateDialog = false">Cancel</v-btn>
                    <v-btn variant="text" color="primary" @click="saveFromDate">OK</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="displayToDate"
                variant="outlined"
                density="compact"
                class="ml-2"
                label="Proposed End Date*"
                :rules="[(v) => !!v || 'Required ']"
                readonly
                @click="toDateDialog = true"
              >
                <template #append-inner>
                  <v-icon @click="toDateDialog = true">mdi-calendar</v-icon>
                </template>
              </v-text-field>
              <v-dialog v-model="toDateDialog" persistent max-width="325">
                <v-card>
                  <v-date-picker
                    v-model="tempToDate"
                    :min="minToDate"
                    color="primary"
                  ></v-date-picker>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" color="primary" @click="toDateDialog = false">Cancel</v-btn>
                    <v-btn variant="text" color="primary" @click="saveToDate">OK</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="displayActualStartDate"
                variant="outlined"
                density="compact"
                label="Actual Start Date"
                readonly
                @click="actualStartDateDialog = true"
              >
                <template #append-inner>
                  <v-icon @click="actualStartDateDialog = true">mdi-calendar</v-icon>
                </template>
              </v-text-field>
              <v-dialog v-model="actualStartDateDialog" persistent max-width="325">
                <v-card>
                  <v-date-picker
                    v-model="tempActualStartDate"
                    color="primary"
                  ></v-date-picker>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" color="primary" @click="actualStartDateDialog = false">Cancel</v-btn>
                    <v-btn variant="text" color="primary" @click="saveActualStartDate">OK</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="displayActualEndDate"
                variant="outlined"
                density="compact"
                class="ml-2"
                label="Actual End Date"
                readonly
                @click="actualEndDateDialog = true"
              >
                <template #append-inner>
                  <v-icon @click="actualEndDateDialog = true">mdi-calendar</v-icon>
                </template>
              </v-text-field>
              <v-dialog v-model="actualEndDateDialog" persistent max-width="325">
                <v-card>
                  <v-date-picker
                    v-model="tempActualEndDate"
                    :min="minActualEndDate"
                    color="primary"
                  ></v-date-picker>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" color="primary" @click="actualEndDateDialog = false">Cancel</v-btn>
                    <v-btn variant="text" color="primary" @click="saveActualEndDate">OK</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
            <v-col cols="6">
              <div class="category-dropdown-container mt-n5">
                <label class="category-label">Category</label>
                <input
                  type="text"
                  v-model="categoryType"
                  @input="handleCategoryInput"
                  @focus="onCategoryFocus"
                  @blur="onCategoryBlur"
                  class="category-input"
                  placeholder="Type or select category..."
                />
                <div v-if="showCategoryDropdown" class="category-dropdown">
                  <div
                    v-for="categoryOption in filterCategories"
                    :key="categoryOption.value"
                    @click="selectCategory(categoryOption)"
                    class="dropdown-item"
                  >
                    <div class="category-name">
                      {{ categoryOption.title }}
                    </div>
                  </div>
                  <div v-if="filterCategories.length === 0" class="no-items">
                    Type to add custom category.
                  </div>
                </div>
              </div>
            </v-col>
            <!-- <v-col cols="6">
              <v-select
                density="compact"
                variant="outlined"
                :items="['Existing Location', 'New Location']"
                class="ml-2"
                v-model="projectLocation"
                multiple
                label="Select Location"
              ></v-select>
            </v-col> -->
            <v-col cols="6">
              <v-select
                density="compact"
                variant="outlined"
                :items="locationItems"  
                class="ml-2"
                v-model="projectLocation"
                item-title="location_name"
                item-value="location_id"
                multiple
                label="Select Location"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                density="compact"
                variant="outlined"
                :rules="[(v) => !!v || 'required ']"
                :items="['INTERNAL', 'EXTERNAL']"
                label="Project Sponsor*"
                v-model="projectSponser"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-textarea
                density="compact"
                label="Skills Required"
                class="ml-2"
                rows="0"
                auto-grow
                variant="outlined"
              ></v-textarea>
            </v-col>
            <v-col v-if="projectSponser == 'INTERNAL'" cols="6">
              <v-autocomplete
                density="compact"
                v-model="clientSponser"
                label="Select User*"
                variant="outlined"
                :rules="[(v) => !!v || 'required ']"
                item-title="full_user_name"
                item-value="user_id"
                :items="userList"
                v-model:search-input="searchp"
                hide-no-data
                placeholder="Min 3 Character"
                @input="searchp = ''"
              >
              </v-autocomplete>
            </v-col>
            <!-- <v-col class="mt-n2" v-if="projectSponser == 'EXTERNAL'" cols="12">
              Client Details
            </v-col> -->
            <v-col v-if="projectSponser == 'EXTERNAL'" cols="6">
              <v-autocomplete
                label="Select Customer*"
                density="compact"
                variant="outlined"
                v-model="customerName"
                :items="customersArray"
                  item-title="customer_name"
                item-value="customer_id"
                :rules="
                  projectSponser === 'EXTERNAL'
                    ? [(v) => !!v || 'Client Name is required']
                    : []
                "
                v-model:search-input="searchcust"
                hide-no-data
                placeholder="Min 3 Character"
                @input="searchcust = ''"
              />
              <!-- <v-text-field
                density="compact"
                variant="outlined"
                v-model="clientName"
                :rules="
                  projectSponser === 'EXTERNAL'
                    ? [(v) => !!v || 'Client Name is required']
                    : []
                "
                label="Client Name*"
              ></v-text-field> -->
            </v-col>
            <!-- <v-col v-if="projectSponser == 'EXTERNAL'" cols="6">
              <v-text-field
                dense
                outlined
                class="ml-2"
                :rules="
                  projectSponser === 'EXTERNAL'
                    ? [
                        (v) =>
                          (v ? /\S+@\S+\.\S+/.test(v) : false) ||
                          'Client Email ID is required',
                      ]
                    : []
                "
                v-model="clientEmail"
                label="Client Email*"
              ></v-text-field>
            </v-col>
            <v-col v-if="projectSponser == 'EXTERNAL'" cols="6">
              <v-autocomplete
                dense
                v-model="clientccode"
                :search-input.sync="search"
                @input="search = ''"
                label="Country Code*"
                :items="countryitems"
                :rules="
                  projectSponser === 'EXTERNAL'
                    ? [(v) => !!v || 'Client Name is required']
                    : []
                "
                class=""
                item-title="name"
                item-value="code"
                outlined
              ></v-autocomplete>
            </v-col>
            <v-col v-if="projectSponser == 'EXTERNAL'" cols="6">
              <v-text-field
                dense
                outlined
                class="ml-2"
                :rules="
                  projectSponser === 'EXTERNAL'
                    ? [
                        (v) =>
                          (v ? v.length >= 8 : false) ||
                          'Client Contact Number is required',
                      ]
                    : []
                "
                v-model="clientContactNumber"
                label="Client Contact Number*"
                @keypress="is_number($event, clientContactNumber)"
              ></v-text-field>
            </v-col> -->
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import CountryList from "@/JsonFiles/CountryList.json";
import { get_location_details } from "@/mixins/GetLocations.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { get_department_details } from "@/mixins/GetDepartments.js";
import { get_global_customers } from "@/mixins/GetGlobalCustomers.js";
export default {
  mixins: [
    get_all_org_users,
    get_location_details,
    get_department_details,
    get_global_customers,
  ],
  data() {
    return {
      projectName: "",
      projectDescription: "",
      fromDate: "",
      toDate: "",
      fromDateDialog: false,
      toDateDialog: false,
      tempFromDate: "",
      tempToDate: "",
      actualStartDate: "",
      actualEndDate: "",
      actualStartDateDialog: false,
      actualEndDateDialog: false,
      tempActualStartDate: "",
      tempActualEndDate: "",
      categoryType: "",
      showCategoryDropdown: false,
      categoryOptions: [
        { title: 'Software and IT', value: 'Software and IT' },
        { title: 'Construction and Engineering', value: 'Construction and Engineering' },
        { title: 'Marketing and Advertising', value: 'Marketing and Advertising' },
        { title: 'Business and Operations', value: 'Business and Operations' },
        { title: 'Research and Development', value: 'Research and Development' },
        { title: 'Education and Training', value: 'Education and Training' },
        { title: 'Events and Entertainment', value: 'Events and Entertainment' },
        { title: 'Environmental and Sustainability', value: 'Environmental and Sustainability' },
        { title: 'Healthcare', value: 'Healthcare' },
        { title: 'Manufacturing', value: 'Manufacturing' },
        { title: 'Creative and Design', value: 'Creative and Design' },
        { title: 'Interior Design', value: 'Interior Design' },
      ],
      locationItems: [],
      projectLocation: [],
      projectSponser: "",
      clientSponser: "",
      clientName: "",
      searchcust: "",
      search: "",
      clientEmail: "",
      clientccode: "",
      countryitems: [],
      customerName: "",
      clientContactNumber: "",
      departmentGroups: [],
      customersArray: [],
      userList: [],
      searchp: "",
      currentDate: this.formatDisplayDate(new Date()),
    };
  },
  async mounted() {
    this.$store.commit("Setnamesearch", "");
    await this.get_location_details();
    await this.get_global_customers();
    // await this.get_department_details();
    await this.get_all_org_users();
    this.fetch_details();
  },

  computed: {
    minToDate() {
      return this.fromDate || this.currentDate;
    },
    minActualEndDate() {
      return this.actualStartDate || this.currentDate;
    },
    displayFromDate() {
      if (!this.fromDate) return '';
      const d = new Date(this.fromDate);
      if (isNaN(d)) return this.fromDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
    displayToDate() {
      if (!this.toDate) return '';
      const d = new Date(this.toDate);
      if (isNaN(d)) return this.toDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
    displayActualStartDate() {
      if (!this.actualStartDate) return '';
      const d = new Date(this.actualStartDate);
      if (isNaN(d)) return this.actualStartDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
    displayActualEndDate() {
      if (!this.actualEndDate) return '';
      const d = new Date(this.actualEndDate);
      if (isNaN(d)) return this.actualEndDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    },
    filterCategories() {
      const query = this.categoryType ? this.categoryType.toLowerCase() : "";
      if (!query) {
        return this.categoryOptions;
      } else {
        return this.categoryOptions.filter((categoryOption) =>
          categoryOption.title.toLowerCase().includes(query)
        );
      }
    }
  },
  methods: {
    is_number(evt, value) {
      evt = evt || window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      }
      if (value.length >= 14 && charCode >= 48 && charCode <= 57) {
        evt.preventDefault();
      }
    },
    formatDisplayDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  },
  formatApiDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`; // yyyy-dd-mm
  },
    fetch_details() {
      this.customersArray = [];
      this.masterCustomers.forEach((customer) => {
        this.customersArray.push({
          customer_name: customer.legal_name + " ( " + customer.customer_display_id + " ) ",
          customer_id: customer.customer_id,
        });
      });
      CountryList.forEach((element) => {
        this.countryitems.push({
          name: element.dial_code + "(" + element.name + ")",
          code: element.dial_code,
        });
      });
      var locationupdate = this.locationList.filter(
        (obj) =>
          obj.location_type == "OFFICE" ||
          obj.location_type == "PROJECT SITE" ||
          obj.location_type == "MAIN_LOCATION"
      );
      locationupdate.forEach((element) => {
        this.locationItems.push({
          location_name: element.location_name,
          location_id: element.location_id,
        });
      });
      this.userList = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userList.push(element);
        }
      });
      // this.departmentGroups = this.departmentList;
    },
 async   validate_request() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.$emit("Nextstep", {
          projectName: this.projectName,
          projectDescription: this.projectDescription,
          from_date: this.formatApiDate(this.fromDate),
          to_date: this.formatApiDate(this.toDate),
          actual_start_date: this.actualStartDate ? this.formatApiDate(this.actualStartDate) : undefined,
          actual_end_date: this.actualEndDate ? this.formatApiDate(this.actualEndDate) : undefined,
          categoryType: this.categoryType,
          projectLocation: this.projectLocation,
          projectSponser: this.projectSponser,
          clientDetails:
            this.projectSponser === "EXTERNAL"
              ? {
                  clientName: this.clientName,
                  clientEmail: this.clientEmail,
                  clientccode: this.clientccode,
                  clientContactNumber: this.clientContactNumber,
                }
              : null,
          clientSponser:
            this.projectSponser === "INTERNAL"
              ? this.clientSponser
              : this.customerName,
        });
      } else {
        this.$emit(
          "validationError",
          "Please fill all required fields before proceeding."
        );
      }
    },
    saveFromDate() {
      this.fromDate = this.tempFromDate;
      this.fromDateDialog = false;
    },
    saveToDate() {
      this.toDate = this.tempToDate;
      this.toDateDialog = false;
    },
    saveActualStartDate() {
      this.actualStartDate = this.tempActualStartDate;
      this.actualStartDateDialog = false;
    },
    saveActualEndDate() {
      this.actualEndDate = this.tempActualEndDate;
      this.actualEndDateDialog = false;
    },
    onCategoryFocus() {
      this.showCategoryDropdown = true;
    },
    onCategoryBlur() {
      setTimeout(() => {
        this.showCategoryDropdown = false;
      }, 200);
    },
    handleCategoryInput() {
      // This method is called on input, keeping it for future use if needed
    },
    selectCategory(categoryOption) {
      this.categoryType = categoryOption.title;
      this.showCategoryDropdown = false;
    },
  },
};
</script>

<style scoped>
.category-dropdown-container {
  position: relative;
  width: 100%;
}

.category-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: 4px;
}

.category-dropdown .dropdown-item {
  padding: 14px 18px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.category-dropdown .dropdown-item:hover {
  background-color: #f8fafc;
}

.category-dropdown .dropdown-item:last-child {
  border-bottom: none;
}

.category-name {
  font-weight: 500;
  color: #333;
}

.category-dropdown .no-items {
  padding: 16px;
  text-align: center;
  color: #666;
  font-style: italic;
  background: #f9f9f9;
}

.category-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 4px;
  line-height: 1.5;
}

.category-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.38);
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  background-color: #fff;
  color: rgba(0, 0, 0, 0.87);
  min-height: 40px;
  box-sizing: border-box;
}

.category-input:focus {
  border-color: #1976d2;
  border-width: 2px;
  padding: 9px 13px;
}

.category-input::placeholder {
  color: rgba(0, 0, 0, 0.38);
}
</style>