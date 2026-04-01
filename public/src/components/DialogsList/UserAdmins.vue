<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="userappAdmins"
      @update:model-value="$emit('update:userappAdmins', $event)"
      persistent
      max-width="900"
    >
      <v-card flat class="rounded-lg">
        <!-- Enhanced Header -->
        <v-toolbar elevation="0" dark dense class="navBar rounded-t-lg">
          <v-toolbar-title class="text--white ml-2">
            <div class="d-flex align-center">
              <v-icon class="mr-3" size="24">mdi-account-group</v-icon>
              <div>
                <div class="text-h6 font-weight-medium">
                  User Access Management
                </div>
                <div class="text-caption opacity-75">
                  {{ rowInfo.dashboard_name }}
                </div>
              </div>
            </div>
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="close_dialog()" class="mr-2">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <!-- Enhanced Form Section -->
        <v-card-text class="pa-6">
          <v-form ref="form">
            <v-row align="center" no-gutters class="mb-4">
              <v-col cols="12" class="mb-4">
                <div class="text-subtitle-1 font-weight-medium mb-3">
                  Access Configuration
                </div>
                <v-row align="center" no-gutters>
                  <v-col cols="auto" class="mr-6">
                    <v-radio-group
                      v-model="useraccess"
                      inline
                      @change="selectTeam = ''"
                      :rules="[(v) => !!v || 'Access type is required']"
                      class="mb-0"
                    >
                      <v-radio
                        label="All Members"
                        value="ALL_USERS"
                        color="primary"
                        class="mr-6"
                      ></v-radio>
                      <v-radio
                        label="Restricted Users"
                        value="RESTRICTED_USERS"
                        color="primary"
                      ></v-radio>
                    </v-radio-group>
                  </v-col>

                  <v-col
                    cols="auto"
                    v-if="useraccess == 'RESTRICTED_USERS'"
                    class="mr-4"
                  >
                    <v-autocomplete
                      v-model="selectTeam"
                      label="Select User"
                      :rules="
                        useraccess == 'ALL_USERS'
                          ? []
                          : [(v) => !!v || 'User selection is required']
                      "
                      variant="outlined"
                      item-title="full_user_name"
                      item-value="user_id"
                      :items="userArray"
                      :search-input.sync="searchF"
                      hide-no-data
                      hide-selected
                      placeholder="Search users..."
                      return-object
                      prepend-inner-icon="mdi-account-search"
                      clearable
                      density="compact"
                      style="min-width: 250px; max-width: 300px"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <v-avatar size="32" color="primary" class="mr-3">
                              <span class="white--text font-weight-medium">
                                {{
                                  (item.raw.full_user_name || "U")
                                    .substring(0, 1)
                                    .toUpperCase()
                                }}
                              </span>
                            </v-avatar>
                          </template>
                          <!-- <v-list-item-title>{{ item.raw.full_user_name || 'Unknown User' }}</v-list-item-title> -->
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-col>

                  <v-col cols="auto">
                    <v-btn
                      @click="add_mutation()"
                      :loading="loading"
                      dark
                      size="small"
                      class="text-capitalize cardCss px-4"
                      prepend-icon="mdi-plus"
                      elevation="2"
                    >
                      Add Access
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>

          <!-- Status Alert -->
          <v-alert
            v-if="admincheck == true"
            type="info"
            variant="tonal"
            class="mb-4"
            icon="mdi-information-outline"
          >
            <div class="font-weight-medium">All Members Access</div>
            <div class="text-caption">
              This app is currently accessible to all organization members.
            </div>
          </v-alert>

          <!-- Enhanced Data Table -->
          <div v-else>
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="text-subtitle-1 font-weight-medium">
                Current Users ({{ tableData ? tableData.length : 0 }})
              </div>
            </div>

            <v-data-table
              :headers="headers"
              :items="tableData || []"
              :loading="tableLoading"
              :sort-by="['client_id']"
              :footer-props="{
                itemsPerPageOptions: [10, 20, 30, 40, 50],
              }"
              :items-per-page="20"
              density="compact"
              class="elevation-1 rounded-lg"
              hover
            >
              <template v-slot:no-data>
                <div class="text-center py-8">
                  <v-icon size="64" color="grey lighten-1" class="mb-4"
                    >mdi-account-group-outline</v-icon
                  >
                  <div class="text-h6 grey--text mb-2">No Users Found</div>
                  <div class="text-body-2 grey--text">
                    Add users to grant access to this app.
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
                  <div class="text-body-2 grey--text">Loading users...</div>
                </div>
              </template>

              <!-- Enhanced Email Column -->
              <template v-slot:[`item.client_id`]="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="32" color="primary" class="mr-3">
                    <span class="white--text font-weight-medium">
                      {{
                        (item.client_id || "U").substring(0, 1).toUpperCase()
                      }}
                    </span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium text-body-2">
                      {{ item.client_id || "No Email" }}
                    </div>
                    <div class="d-flex align-center mt-1">
                      <v-chip
                        v-if="
                          item.user_type == 'ADMIN' || item.user_type == 'OWNER'
                        "
                        size="x-small"
                        color="deep-purple lighten-4"
                        text-color="deep-purple darken-2"
                        variant="flat"
                        class="mr-2"
                      >
                        <v-icon size="12" class="mr-1">mdi-account-cog</v-icon>
                        {{ item.user_type }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Enhanced Actions Column -->
              <template v-slot:[`item.action`]="{ item }">
                <div class="d-flex align-center justify-center">
                  <v-tooltip
                    location="top"
                    v-if="
                      item.user_type != 'OWNER' && item.user_type != 'ADMIN'
                    "
                  >
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon
                        size="small"
                        color="error"
                        variant="text"
                        @click.stop="delete_admins(item)"
                        v-bind="props"
                        class="cursor-pointer"
                      >
                        <v-icon size="18">mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>Remove Access</span>
                  </v-tooltip>
                  <span v-else class="text-caption grey--text">-</span>
                </div>
              </template>
            </v-data-table>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <div v-if="componentCheck == 2">
      <DeleteuserAdmins
        :deleteadmins="deleteadmins"
        @clicked="deleteadmins = false"
        :adminitems="adminitems"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        :rowInfo="rowInfo"
      />
    </div>
  </div>
</template>
  
<script>
/* eslint-disable */
import { edit_user_app_access } from "@/graphql/mutations.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import DeleteuserAdmins from "./DeleteuserAdmins.vue";
import { list_user_app_subscribers } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,

    DeleteuserAdmins,
  },
  mixins: [get_all_org_users],
  props: {
    userappAdmins: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      SnackBarComponent: {},

      componentCheck: 0,
      onBoardDialog: false,
      deleteadmins: false,
      loading: false,
      searchF: "",
      headers: [
        { title: "User", value: "client_id", sortable: true },
        { title: "Actions", value: "action", sortable: false, align: "center" },
      ],
      tableData: [],
      height: 0,
      tableLoading: false,
      adminitems: {},
      approvalType: "",
      admincheck: false,
      selectTeam: "",
      formDetails: {},
      formViewDailog: false,
      fixed: true,
      actionItem: "",
      viewAction: "Inititaie",
      useraccess: "ALL_USERS",
      userArray: [],
    };
  },
  watch: {
    userappAdmins: {
      async handler() {
        this.height = window.innerHeight - 290;
        this.useraccess =
          this.rowInfo.user_access == null
            ? "ALL_USERS"
            : this.rowInfo.user_access;
        this.selectTeam = "";
        this.$store.commit("Setnamesearch", "");
        await this.adminslist();
        await this.get_all_org_users();
        await this.fetch_details();
      },
      immediate: true,
    },
    tableData: {
      handler(newVal) {
        if (newVal && newVal.length > 1) {
          this.useraccess = "RESTRICTED_USERS";
        }
      },
      immediate: true,
    },
  },
  // created() {
  //    console.log(this.$store.getters.GetAppDetails.dashboard_id);

  // },
  methods: {
    async add_mutation() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;

        try {
          let result = await API.graphql(
            graphqlOperation(edit_user_app_access, {
              input: {
                user_access: this.useraccess,
                action_type: "ADD",
                user_email_id:
                  this.useraccess == "ALL_USERS"
                    ? undefined
                    : this.selectTeam.user_id,
                dashboard_id: this.rowInfo.dashboard_id,
              },
            })
          );
          this.loading = false;

          var response = JSON.parse(result.data.edit_user_app_access);
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.selectTeam = "";

            this.$refs.form.reset();

            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: response.Message,
              timeout: 5000,
              Top: true,
            };
            this.adminslist();
            this.useraccess = "ALL_USERS";
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
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: error.errors[0].message,
            timeout: 5000,
            Top: true,
          };

          this.loading = false;
        }
      }
    },
    fetch_details() {
      // Clear the array first to prevent duplicates
      this.userArray = [];
      const seenUserIds = new Set();
      this.orgUsers.forEach((element) => {
        if (
          element.user_status == "ACTIVE" &&
          element.user_type != "CHATBOT" &&
          !seenUserIds.has(element.user_email_id)
        ) {
          seenUserIds.add(element.user_email_id);
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_id: element.user_email_id,
          });
        }
      });
    },
    close_dialog() {
      this.useraccess = "ALL_USERS";
      this.selectTeam = "";

      this.$emit("clicked", 0);
    },
    async adminslist() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(list_user_app_subscribers, {
            input: {
              dashboard_id: this.rowInfo.dashboard_id,
            },
          })
        );
        this.tableLoading = false;
        this.tableData = [];

        if (result && result.data && result.data.list_user_app_subscribers) {
          var response = JSON.parse(result.data.list_user_app_subscribers);
          this.tableData = response.data || [];
          this.admincheck = response.all_users || false;
        } else {
          this.tableData = [];
          this.admincheck = false;
        }

        // console.log(response);
        // console.log(response);
      } catch (error) {
        // console.log(error);
        this.tableLoading = false;
        this.tableData = [];
        this.admincheck = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    delete_admins(item) {
      this.adminitems = item;
      this.componentCheck = 2;
      this.deleteadmins = true;
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

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };

      this.deleteadmins = false;
      this.adminslist();
    },
  },
};
</script>
  
<style scoped>
.max-width-400 {
  max-width: 400px;
}

.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

.rounded-lg {
  border-radius: 12px !important;
}

.rounded-t-lg {
  border-top-left-radius: 12px !important;
  border-top-right-radius: 12px !important;
}

/* Enhanced table styling */
.v-data-table :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}

.v-data-table :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.v-data-table :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}

/* Enhanced form styling */
.v-form :deep(.v-field) {
  border-radius: 8px;
}

.v-form :deep(.v-field--variant-outlined) {
  border-radius: 8px;
}
</style>