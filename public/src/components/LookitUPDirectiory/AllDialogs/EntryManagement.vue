<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div>
      <v-card class="mt-n9" flat>
        <!-- Top Controls: All in one row -->
        <v-row class="align-center px-6 pt-6 pb-2">
          <!-- <v-col cols="auto" class="d-flex align-center">
            <v-icon class="mr-3" color="primary" size="large">mdi-format-list-bulleted</v-icon>
            <span class="font-weight-bold text-h6">{{ $store.getters.GetFormName }} ({{ totalCount }})</span>
          </v-col> -->
          <v-spacer />

          <!-- Refresh and Search -->
          <v-col cols="auto" class="d-flex align-center">
            <v-icon
              class="mt-n2 mr-4"
              dense
              color="primary"
              @click="refresh_data()"
              >mdi-refresh</v-icon
            >
            <v-select
              v-model="filterBy"
              :items="filterByOptions"
              label="Filter By"
              variant="solo"
              hide-details
              style="width: 200px;"
              v-if="filterEnabled"
              density="compact"
              class="mr-4"
            ></v-select>
            <v-text-field
              v-model="searchlist"
              placeholder="Search entries..."
              prepend-inner-icon="mdi-magnify"
              variant="solo"
              hide-details
              density="compact"
              class="search-pill"
              style="
                min-width: 280px;
                max-width: 280px;
                height: 32px;
                border-radius: 999px;
                background: #fff;
                box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
                font-size: 14px;
              "
              clearable
              @click:clear="searchlist = ''"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Data Table -->
        <v-card-text class="pa-4">
          <v-data-table
            :headers="entryHeaders"
            :items="paginatedItems"
            :loading="tableLoading"
            :items-per-page="itemsPerPage"
            :page="currentPage"
            :server-items-length="totalCount"
            hide-default-footer
            class="modern-data-table"
            density="comfortable"
            hover
            :fixed-header="true"
            :height="windowHeight"
            @click:row="handle_row_click"
          >
            <template v-slot:no-data>
              <div class="text-center py-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4"
                  >mdi-format-list-bulleted</v-icon
                >
                <div class="text-h6 text-grey mb-2">No Entries Found</div>
                <div class="text-body-2 text-grey">
                  Try adjusting your search criteria or add a new entry.
                </div>
              </div>
            </template>

            <template v-slot:loading>
              <div class="text-center py-8">
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="32"
                  class="mb-4"
                ></v-progress-circular>
                <div class="text-body-2 text-grey">Loading entries...</div>
              </div>
            </template>

            <template v-slot:[`item.created_on`]="{ item }">
              <div class="d-flex align-center">
                <v-icon size="16" color="primary" class="mr-2"
                  >mdi-calendar</v-icon
                >
                <span class="caption">{{ get_date(item.created_on) }}</span>
              </div>
            </template>
            <template v-slot:[`item.created_by`]="{ item }">
              <div class="d-flex align-center">
                <v-icon size="16" color="primary" class="mr-2"
                  >mdi-account</v-icon
                >
                <span class="caption">{{
                  item.created_by != "EXTERNAL USER" &&
                  item.created_by != "EXTERNAL_USER"
                    ? fethc_names(item.created_by)
                    : item.created_by
                }}</span>
              </div>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-menu offset-y>
                <template #activator="{ props }">
                  <v-btn icon v-bind="props" variant="text">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item
                    style="font-size: 12px"
                    @click.stop="edit_entry(item)"
                  >
                    Edit Entry</v-list-item
                  >
                  <v-divider />
                  <v-list-item
                    style="font-size: 12px"
                    @click.stop="delete_entry(item)"
                  >
                    Delete Entry</v-list-item
                  >
                  <v-divider
                    v-if="
                      item.responseObject.attachments_keys &&
                      item.responseObject.attachments_keys.length > 0
                    "
                  />
                  <v-list-item
                    v-if="
                      item.responseObject.attachments_keys &&
                      item.responseObject.attachments_keys.length > 0
                    "
                    style="font-size: 12px"
                    @click.stop="view_media(item)"
                  >
                    Attachments</v-list-item
                  >
                  <v-divider v-show="directoryInfo.is_geo_tagged == true" />
                  <v-list-item
                    style="font-size: 12px"
                    @click.stop="get_location(item)"
                    v-show="directoryInfo.is_geo_tagged == true"
                  >
                    View Location</v-list-item
                  >
                </v-list>
              </v-menu>
            </template>
          </v-data-table>

          <!-- Modern Table Footer -->
          <div class="table-footer">
            <div class="footer-info">
              {{
                totalCount === 0
                  ? "No Results"
                  : `Showing ${paginatedItems.length} of ${totalCount} entries`
              }}
            </div>
            <div class="pagination-controls">
              <v-btn
                :disabled="currentPage === 1"
                variant="text"
                size="small"
                class="pagination-btn"
                @click="currentPage = currentPage - 1"
                style="color: #666 !important"
              >
                Previous
              </v-btn>
              <div class="page-numbers">
                <v-btn
                  v-for="page in visiblePages"
                  :key="page"
                  :variant="page === currentPage ? 'elevated' : 'text'"
                  size="small"
                  :class="
                    page === currentPage ? 'active-page' : 'inactive-page'
                  "
                  @click="currentPage = page"
                  :style="
                    page === currentPage
                      ? 'background: #DB4C77 !important; color: white !important;'
                      : 'color: #666 !important;'
                  "
                >
                  {{ page }}
                </v-btn>
              </div>
              <v-btn
                :disabled="currentPage === pageCount"
                variant="text"
                size="small"
                class="pagination-btn"
                @click="currentPage = currentPage + 1"
                style="color: #666 !important"
              >
                Next
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <div v-if="componentCheck == 1">
        <EditEntryAction
          :editEntriesDialog="editEntriesDialog"
          :formAction="formAction"
          :formActionType="formActionType"
          :formDetails="formDetails"
          v-on:successMsg="success_info"
          v-on:errorMsg="error_info"
          @clicked="close_action_edit"
        />
      </div>
      <div v-if="componentCheck == 2">
        <DeleteEntry
          :deleteEntryDialog="deleteEntryDialog"
          :entryInfo="entryInfo"
          v-on:successMsg="success_info"
          v-on:errorMsg="error_info"
          @clicked="deleteEntryDialog = false"
        />
      </div>
      <div v-if="componentCheck == 3">
        <EntryInfo
          :addEntryInfo="addEntryInfo"
          :formDetails="formDetails"
          v-on:successMsg="success_info"
          v-on:errorMsg="error_info"
          @clicked="addEntryInfo = false"
          :tableData="tableData"
        />
      </div>
      <div v-if="componentCheck == 4">
        <GeoLocation
          :viewGeoLocation="viewGeoLocation"
          @clicked="viewGeoLocation = false"
          :entryInfo="entryInfo"
        />
      </div>
      <div v-if="componentCheck == 5">
        <ViewAttachments
          :mediaView="mediaView"
          @clicked="mediaView = false"
          :entryInfo="entryInfo"
        />
      </div>
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import { get_particular_directory } from "@/graphql/queries.js";
import ViewAttachments from "@/components/LookitUPDirectiory/AllDialogs/ViewAttachments.vue";
import GeoLocation from "@/components/LookitUPDirectiory/AllDialogs/GeoLocation.vue";
import {
  list_Directory_entries_portal,
  ListS3DirectoryEntries,
} from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import EditEntryAction from "@/components/LookitUPDirectiory/AllDialogs/EditEntryAction.vue";
import DeleteEntry from "@/components/LookitUPDirectiory/AllDialogs/DeleteEntry.vue";
import EntryInfo from "@/components/LookitUPDirectiory/AllDialogs/EntryInfo.vue";
import SnackBar from "@/components/SnackBar.vue";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { formatdisplayDate, formatTime } from "@/JsonFiles/DateFormate.js";

export default {
  components: {
    EditEntryAction,
    GeoLocation,
    DeleteEntry,
    SnackBar,
    EntryInfo,
    ViewAttachments,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      entryHeaders: [
        // { text: "Title", value: "workflow_payload.title", sortable: false },
        // { text: "Summary Field 1", value: "summary_field_1", sortable: false },
        // { text: "Summary Field 2", value: "summary_field_2", sortable: false },
        // { text: "Filter By", value: "filter_by", sortable: false },
        { title: "Created On", key: "created_on", sortable: false },
        //  { text: "Updated On", value: "update_On", sortable: false },
        { title: "Created By", key: "created_by", sortable: false },

        { title: "Actions", key: "actions", sortable: false },
      ],
      tableData: [],
      filterByOptions: [],
      filterEnabled: false,
      tableLoading: false,
      searchlist: "",
      directoryInfo: {},
      componentCheck: 0,
      editEntriesDialog: false,
      deleteEntryDialog: false,
      mediaView: false,
      entryInfo: {},
      SnackBarComponent: {},
      formAction: "",
      viewGeoLocation: false,
      formActionType: "initiate",
      formDetails: {},
      editCompo: 0,
      addEntryInfo: false,
      allusers: [],
      summaryData1: "",
      summaryData2: "",
      itemsPerPage: 20,
      currentPage: 1,
      filterBy: "All",
    };
  },
  props: {
    formInfo: Object,
    rowInfo: Object,
  },

  async created() {
    this.directoryInfo = this.$store.getters.GetFormObject;
    // this.sort_table_data();

    this.fetch_dynamic_headers();
    // this.fetch_directory_entries();
    this.fetch_s3_enteries();
    await this.get_all_org_users();
    this.allusers = this.orgUsers;
    this.fetch_directory_details();
  },

  methods: {
    async fetch_directory_details() {
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_directory, {
            input: {
              directory_id: this.$store.getters.GetFormObject.directory_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_particular_directory);
        // console.log(response);
        this.filterEnabled = false;
        if (response.Status == "SUCCESS") {
          let directoryDetails = response.Data[0];
          // console.log(directoryDetails);
          if (directoryDetails.filter_by) {
            // console.log(directoryDetails.filter_by);
            let filterBy = directoryDetails.directory_design_template.find(
              field => field.displayLabel.toLowerCase() === directoryDetails.filter_by.toLowerCase()
            );
            // console.log(filterBy.fieldOptions);
            this.filterByOptions = filterBy.fieldOptions;
            this.filterByOptions.push("All");
            this.filterEnabled = true;
          }
        }
        // console.log(response.Data[0]);
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
    view_media(item) {
      this.componentCheck = 5;
      this.entryInfo = item.responseObject;
      this.mediaView = true;
    },
    get_location(item) {
      this.componentCheck = 4;
      this.entryInfo = item.responseObject;
      this.viewGeoLocation = true;
    },
    fethc_names(value) {
      var name = "";
      this.orgUsers.forEach((element) => {
        if (element.user_email_id == value) {
          name = element.full_user_name;
        }
      });
      return name;
    },
    fetch_dynamic_headers() {
      var array = [];
      let summaryField1 = this.process_field(
        this.directoryInfo.summary_field_1
      );

      let summaryField2 = this.process_field(
        this.directoryInfo.summary_field_2
      );
      let filterBy = this.process_field(this.directoryInfo.filter_by);

      let formTemplate = [];
      if (
        this.directoryInfo.directory_template &&
        Array.isArray(this.directoryInfo.directory_template)
      ) {
        formTemplate = this.directoryInfo.directory_template;
      }
      array.unshift({
        title: "SI NO",
        key: "serial_number",
        sortable: false,
      });
      if (formTemplate.length > 0 && formTemplate[0]) {
        array.push({
          title: formTemplate[0].display_label,
          key: formTemplate[0].key,
          sortable: false,
        });
      }

      if (summaryField1 != null && formTemplate.length > 0) {
        const matchingItem = formTemplate.find(
          (item) => item.key === summaryField1
        );

        if (matchingItem) {
          this.summaryData1 = matchingItem.data_type;
          array.push({
            title: matchingItem.display_label + "(Summary Field1)",
            key: this.modify_summary_one(matchingItem.key),
            sortable: false,
          });
        }
      }
      if (summaryField2 != null && formTemplate.length > 0) {
        const sum2 = formTemplate.find((item) => item.key === summaryField2);
        if (sum2) {
          this.summaryData2 = sum2.data_type;
          array.push({
            title: sum2.display_label + "(Summary Field2)",
            key: this.modify_summary_one(sum2.key),
            sortable: false,
          });
        }
      }
      if (filterBy != null && formTemplate.length > 0) {
        const dfilter = formTemplate.find((item) => item.key === filterBy);
        if (dfilter) {
          array.push({
            title: dfilter.display_label + "(Filter By)",
            key: this.modify_summary_one(dfilter.key),
            sortable: false,
          });
        }
      }

      this.entryHeaders = [...array, ...this.entryHeaders];
    },

    refresh_data() {
      this.tableData = [];
      // this.fetch_directory_entries();
      this.fetch_s3_enteries();
    },

    handle_row_click(event, { item }) {
      this.formDetails = item;
      console.log("formDetails",this.formDetails)
      this.addEntryInfo = true;
      localStorage.setItem("drectoryPayload", JSON.stringify(item));
      this.componentCheck = 3;
    },

    process_field(field) {
      if (field != null && field != undefined) {
        return field;
      }
    },

    modify_summary_one(value) {
      if (value == "user_id") {
        return "user_id_text";
      } else if (value == "location_id") {
        return "location_id_text";
      } else if (value == "designation_id") {
        return "designation_id_text";
      } else {
        return value;
      }
    },

    close_action_edit() {
      this.editEntriesDialog = false;
      this.componentCheck = 0;
      this.formDetails = {};
      this.formAction = "";
    },

    success_info(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.deleteEntryDialog = false;
      this.editEntriesDialog = false;
      this.tableData = [];
      // this.fetch_directory_entries();
      this.fetch_s3_enteries();
      this.componentCheck = 0;
    },

    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    get_date(val) {
      let a = new Date(val * 1000).toLocaleTimeString("en-In", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return a.toUpperCase();
      // const d = new Date(parseInt(val) * 1000);
      // var date = d.getDate().toLocaleString();
      // var month = (d.getMonth() + 1).toLocaleString();
      // var year = d.getFullYear();

      // return (
      //   (+date <= 9 ? "0" + date : date) +
      //   "/" +
      //   (+month <= 9 ? "0" + month : month) +
      //   "/" +
      //   year
      // );
    },

    async fetch_directory_entries() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(list_Directory_entries_portal, {
            input: {
              directory_id: this.formInfo.directory_id,
            },
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        var allData = [];
        var response = JSON.parse(result.data.list_Directory_entries_portal);
        // let serialNumber = 1;
        if (response.Status == "SUCCESS") {
          response.data.forEach((element, index) => {
            const newObject = {
              ...element.workflow_payload,
              created_on: element.created_on,
              created_by: element.created_by,
              update_On:
                element.entry_updated_on == undefined
                  ? element.created_on
                  : element.entry_updated_on,

              responseObject: element,
              directory_template: this.directoryInfo.directory_template,
              // serial_number: serialNumber++,
              entry_id: element.entry_id, // Add new key-value pair
            };

            allData.push(newObject);
          });
          const dateKeys = this.directoryInfo.directory_template
            .filter((template) => template.data_type === "date")
            .map((template) => template.key);

          const formattedData = await this.modify_date_format(
            allData,
            dateKeys
          );
          this.sort_table_data(formattedData);
          // if (
          //   this.directoryInfo.directory_template[0].data_type == "date" &&
          //   this.summaryData1 == "date" &&
          //   this.summaryData2 != "" &&
          //   this.summaryData2 == "date"
          // ) {
          //   const formattedData = await this.modify_date_format(
          //     allData,
          //     this.directoryInfo.directory_template[0].key
          //   );
          //   this.sort_table_data(formattedData);
          //   // console.log(allData);
          // } else {
          //   this.sort_table_data(allData);
          // }
        }
      } catch (error) {
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    async fetch_S3_file(value) {
      var responseData = null;
      let data = null;
      // this.loading = true;
      // this.errorMessage = "";

      try {
        const response = await fetch(value);
        if (!response.ok) {
          throw new Error("Failed to fetch the file");
        }
        responseData = await response.text();
        data = JSON.parse(responseData);
        // console.log(data);
        return data;
      } catch (error) {
        this.errorMessage = "Error fetching file: " + error.message;
      } finally {
        // this.loading = false;
      }
    },
    async fetch_s3_enteries() {
      this.tableLoading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(ListS3DirectoryEntries, {
            input: {
              directory_id: this.formInfo.directory_id,
            },
          })
        );
        this.tableLoading = false;
        this.tableData = [];
        var allData = [];
        var response = JSON.parse(result.data.ListS3DirectoryEntries);

        // Check if response has data and directory_entries_url
        if (
          !response.data ||
          !response.data[0] ||
          !response.data[0].directory_entries_url
        ) {
          this.tableData = [];
          return;
        }

        var data = await this.fetch_S3_file(
          response.data[0].directory_entries_url
        );

        // Check if data is defined and is an array
        if (!data || !Array.isArray(data)) {
          this.tableData = [];
          return;
        }

        data.forEach((element, index) => {
          const newObject = {
            ...element.workflow_payload,
            created_on: element.created_on,
            created_by: element.created_by,
            update_On:
              element.entry_updated_on == undefined
                ? element.created_on
                : element.entry_updated_on,

            responseObject: element,
            directory_template: this.directoryInfo.directory_template,
            // serial_number: serialNumber++,
            entry_id: element.entry_id,
            directory_id: this.formInfo.directory_id, // Add new key-value pair
          };

          allData.push(newObject);
        });
        const dateKeys = this.directoryInfo.directory_template
          .filter((template) => template.data_type === "date")
          .map((template) => template.key);

        const formattedData = await this.modify_date_format(allData, dateKeys);
        this.sort_table_data(formattedData);
      } catch (error) {
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            error.errors?.[0]?.message ||
            "An error occurred while fetching entries",
          timeout: 5000,
          Top: true,
        };
      }
    },
    async modify_date_format(existingArray, keys) {
      return existingArray.map((obj) => {
        let updatedObj = { ...obj };

        keys.forEach((key) => {
          if (obj.hasOwnProperty(key)) {
            updatedObj[key] = this.formate_date(obj[key]);
          }
        });

        return updatedObj;
      });
    },
    // modify_date_format(exisitngarray, key) {
    //   return exisitngarray.map((obj) => {
    //     if (obj.hasOwnProperty(key)) {
    //       return {
    //         ...obj,
    //         [key]: this.formate_date(obj[key]),
    //       };
    //     }

    //     return obj;
    //   });
    // },

    // exisitngarray.map((obj) => {
    //   if (obj.hasOwnProperty(key)) {
    //     return { ...obj, [key]: this.formate_date(key) };
    //   }
    //   return obj;
    // });

    formate_date(value) {
      if (value == "") {
        return value;
      }

      var data = formatdisplayDate(value);
      return data;
    },

    sort_table_data(value) {
      // console.log(value,'value')
      var data = this.$store.getters.GetFormObject;
      let titleKey = "";
      if (
        this.directoryInfo.directory_template &&
        Array.isArray(this.directoryInfo.directory_template) &&
        this.directoryInfo.directory_template[0]
      ) {
        titleKey = this.directoryInfo.directory_template[0].key;
      }

      if (titleKey && data.directory_sort_order == "title_alphabetical") {
        value.sort((a, b) => {
          return a[titleKey]
            .toLowerCase()
            .localeCompare(b[titleKey].toLowerCase());
        });

        this.tableData = value;
        for (let i = 0; i < this.tableData.length; i++) {
          // Add the new key-value pair to each object
          this.tableData[i]["serial_number"] = i + 1;
        }
      } else if (data.directory_sort_order == "created_on_ascending") {
        value.sort((a, b) => {
          return b.created_on - a.created_on;
        });

        this.tableData = value;
        for (let i = 0; i < this.tableData.length; i++) {
          // Add the new key-value pair to each object
          this.tableData[i]["serial_number"] = i + 1;
        }
      } else if (data.directory_sort_order == "updated_on_descending") {
        value.sort((a, b) => {
          return b.update_On - a.update_On;
        });
        this.tableData = value;
        for (let i = 0; i < this.tableData.length; i++) {
          // Add the new key-value pair to each object
          this.tableData[i]["serial_number"] = i + 1;
        }
      } else if (
        data.directory_sort_order == "title_alphabetical_descending" &&
        this.directoryInfo.directory_template &&
        Array.isArray(this.directoryInfo.directory_template) &&
        this.directoryInfo.directory_template[0] &&
        this.directoryInfo.directory_template[0].data_type == "date"
      ) {
        const today = new Date().toDateString();

        value.sort((a, b) => {
          const dateA = this.parseDate(a[titleKey]);
          const dateB = this.parseDate(b[titleKey]);

          const todayDate = new Date().toDateString();
          const dateAString = dateA.toDateString();
          // console.log(dateAString);
          const dateBString = dateB.toDateString();

          if (dateAString === todayDate && dateBString !== todayDate) {
            return -1; // dateA (today) should come before dateB
          } else if (dateAString !== todayDate && dateBString === todayDate) {
            return 1; // dateB (today) should come before dateA
          } else {
            return dateB - dateA; // Sort remaining dates in descending order
          }
        });

        this.tableData = value;

        for (let i = 0; i < this.tableData.length; i++) {
          // Add the new key-value pair to each object
          this.tableData[i]["serial_number"] = i + 1;
        }
      } else {
        this.tableData = value;
        for (let i = 0; i < this.tableData.length; i++) {
          // Add the new key-value pair to each object
          this.tableData[i]["serial_number"] = i + 1;
        }
      }
      // console.log(this.tableData, "this.tableData");
    },

    parseDate(dateString) {
      const [day, month, year] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day); // month is 0-based
    },
    edit_entry(value) {
      this.formDetails = {};
      this.formDetails = value;
      this.formAction = "Pending";
      localStorage.setItem("drectoryPayload", JSON.stringify(value));
      this.componentCheck = 1;
      this.editEntriesDialog = true;
      // if (
      //   value.created_by == this.$store.getters.GetUserObj.user.user_email_id
      // ) {
      //   this.formDetails = value;
      //   this.componentCheck = 1;
      //   this.editEntriesDialog = true;
      // } else {
      //   this.SnackBarComponent = {
      //     SnackbarVmodel: true,
      //     SnackbarColor: "red",
      //     SnackbarText:
      //       "An entry that has not been added by you cannot be edited.",
      //     timeout: 5000,
      //     Top: true,
      //   };
      // }
    },

    delete_entry(value) {
      this.componentCheck = 2;
      this.deleteEntryDialog = true;
      this.entryInfo = value;
      // if (
      //   value.created_by == this.$store.getters.GetUserObj.user.user_email_id
      // ) {
      //   this.componentCheck = 2;
      //   this.deleteEntryDialog = true;
      //   this.entryInfo = value;
      // } else {
      //   this.SnackBarComponent = {
      //     SnackbarVmodel: true,
      //     SnackbarColor: "red",
      //     SnackbarText:
      //       "An entry that has not been added by you cannot be deleted.",
      //     timeout: 5000,
      //     Top: true,
      //   };
      // }
    },
  },
  computed: {
    filteredItems() {
      let filteredData = this.tableData;

      // Apply dropdown filter first
      if (this.filterBy && this.filterBy !== "All" && this.filterEnabled) {
        // Find the filter field from directory design template
        const filterField = this.directoryInfo.directory_design_template?.find(
          field => field.displayLabel.toLowerCase() === this.directoryInfo.filter_by?.toLowerCase()
        );
        
        if (filterField) {
          const filterKey = filterField.original_key;
          filteredData = filteredData.filter((entry) => {
            return entry[filterKey] === this.filterBy;
          });
        }
      }

      // Apply search filter
      if (!this.searchlist || this.searchlist.trim() === "") {
        return filteredData;
      }
      
      const searchTerm = this.searchlist.toLowerCase().trim();
      return filteredData.filter((entry) => {
        // Search in entry title (first field)
        const titleKey = this.directoryInfo.directory_template?.[0]?.key;
        if (titleKey && entry[titleKey]?.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in created by
        const createdBy = this.fethc_names(entry.created_by);
        if (createdBy?.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in created date
        const createdDate = this.get_date(entry.created_on);
        if (createdDate?.toLowerCase().includes(searchTerm)) {
          return true;
        }

        // Search in summary fields if they exist
        if (this.directoryInfo.summary_field_1) {
          const summary1Key = this.modify_summary_one(
            this.directoryInfo.summary_field_1
          );
          if (entry[summary1Key]?.toLowerCase().includes(searchTerm)) {
            return true;
          }
        }

        if (this.directoryInfo.summary_field_2) {
          const summary2Key = this.modify_summary_one(
            this.directoryInfo.summary_field_2
          );
          if (entry[summary2Key]?.toLowerCase().includes(searchTerm)) {
            return true;
          }
        }

        return false;
      });
    },
    totalCount() {
      return this.filteredItems.length;
    },
    pageCount() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredItems.slice(start, end);
    },
    visiblePages() {
      const totalPages = this.pageCount;
      const current = this.currentPage;
      const delta = 2;

      let start = Math.max(1, current - delta);
      let end = Math.min(totalPages, current + delta);

      if (end - start < 4) {
        if (start === 1) {
          end = Math.min(totalPages, start + 4);
        } else {
          start = Math.max(1, end - 4);
        }
      }

      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    },
    windowHeight() {
      return window.innerHeight - 320; // Adjust height based on header and footer
    },
  },
  watch: {
    searchlist() {
      this.currentPage = 1;
    },
    filterBy() {
      this.currentPage = 1;
    },
    currentPage() {
      // Scroll to top when page changes
      const table = document.querySelector(".modern-data-table");
      if (table) table.scrollIntoView({ behavior: "smooth", block: "start" });
    },
  },
};
</script>
<style scoped>
.wrap-text {
  white-space: normal !important;
  word-wrap: break-word !important;
  font-size: 1px !important;
}

/* Modern Data Table */
.modern-data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modern-data-table :deep(.v-data-table__wrapper) {
  border-radius: 12px;
}

.modern-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.modern-data-table :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-top: 1px solid #e0e0e0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.footer-info {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  font-size: 14px !important;
  font-weight: 500 !important;
  text-transform: none !important;
  min-width: 80px !important;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.active-page {
  background: #db4c77 !important;
  color: white !important;
  font-weight: 500 !important;
  min-width: 36px !important;
  height: 36px !important;
}

.inactive-page {
  color: #666 !important;
  font-weight: 400 !important;
  min-width: 36px !important;
  height: 36px !important;
}

/* Legacy styles cleanup - keeping only what's needed */
.search-pill :deep(.v-field__input) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 32px;
}

.search-pill :deep(.v-field__prepend-inner) {
  padding-inline-start: 12px;
}

.entry-management-container {
  padding-bottom: 80px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .table-footer {
    flex-direction: column;
    gap: 16px;
    padding: 12px 16px;
  }

  .pagination-controls {
    gap: 4px;
  }

  .pagination-btn {
    min-width: 60px !important;
    font-size: 12px !important;
  }

  .page-numbers {
    gap: 2px;
  }

  .active-page,
  .inactive-page {
    min-width: 32px !important;
    height: 32px !important;
    font-size: 12px !important;
  }
}

@media (max-width: 480px) {
  .table-footer {
    padding: 8px 12px;
  }

  .footer-info {
    font-size: 12px;
  }

  .pagination-btn {
    min-width: 50px !important;
    font-size: 11px !important;
  }

  .active-page,
  .inactive-page {
    min-width: 28px !important;
    height: 28px !important;
    font-size: 11px !important;
  }
}
</style>
