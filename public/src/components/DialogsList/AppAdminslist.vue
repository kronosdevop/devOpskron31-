<template>
  <!-- eslint-disable -->
  <div>
    <v-dialog
      :model-value="adminList"
      @update:model-value="$emit('update:adminList', $event)"
      persistent
      max-width="1100"
      transition="dialog-top-transition"
    >
      <v-card flat class="rounded-lg">
        <!-- Modernized Header -->
        <v-toolbar elevation="0" dark dense class="navBar rounded-t-lg">
          <v-toolbar-title class="text--white ml-2">
            <div class="d-flex align-center">
              <v-icon class="mr-3" size="24">mdi-account-cog</v-icon>
              <div>
                <div class="text-h6 font-weight-medium">App Admins</div>
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
        <!-- Form Section -->
        <v-card-text class="pa-6">
          <v-form ref="form">
            <v-row align="center" no-gutters class="mb-4">
              <v-col cols="auto">
                <v-autocomplete
                  v-model="selectTeam"
                  label="Select User"
                  :rules="
                    useraccess == 'ALL' ? [] : [(v) => !!v || 'required ']
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
                    </v-list-item>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="auto">
                <v-btn
                  depressed
                  @click="add_mutation()"
                  :loading="loading"
                  dark
                  size="small"
                  class="text-capitalize ml-2 mt-n6 cardCss px-4"
                  prepend-icon="mdi-plus"
                  elevation="2"
                >
                  Add Admin
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
          <!-- Data Table -->
          <div class="d-flex align-center justify-space-between mb-4 mt-6">
            <div class="text-subtitle-1 font-weight-medium">
              Current Admins ({{ tableData ? tableData.length : 0 }})
            </div>
          </div>
          <v-data-table
            :headers="headers"
            :height="height"
            :fixed-header="fixed"
            :items="tableData"
            :loading="tableLoading"
            :sort-by="['workflow_name']"
            :footer-props="{
              itemsPerPageOptions: [10, 20, 30, 40, 50],
            }"
            :items-per-page="20"
            density="compact"
            class="elevation-1 rounded-lg dtwidth"
            hover
          >
            <template v-slot:[`item.user_email_id`]="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="32" color="primary" class="mr-3">
                  <span class="white--text font-weight-medium">
                    {{
                      (item.user_email_id || "U").substring(0, 1).toUpperCase()
                    }}
                  </span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium text-body-2">
                    {{ item.user_email_id || "No Email" }}
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
            <template v-slot:[`item.action`]="{ item }">
              
                <v-tooltip
                  location="top"
                  v-if="item.user_type != 'OWNER'"
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
                  <span>Remove Admin</span>
                </v-tooltip>
                <span v-else class="text-caption grey--text">-</span>
              
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <div v-if="componentCheck == 1">
      <AddappAdmins
        :appAdmins="appAdmins"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="appAdmins = false"
        :rowInfo="rowInfo"
      />
    </div>
    <div v-if="componentCheck == 2">
      <DeleteappAdmins
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
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import DeleteappAdmins from "./DeleteappAdmins.vue";
import { add_and_list_appadmins } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import AddappAdmins from "./AddappAdmins.vue";
export default {
  components: {
    SnackBar,
    AddappAdmins,
    DeleteappAdmins,
  },
  props: {
    adminList: Boolean,
    rowInfo: Object,
  },
  mixins: [get_all_org_users],
  data() {
    return {
      SnackBarComponent: {},
      appAdmins: false,
      componentCheck: 0,
      onBoardDialog: false,
      loading: false,
      deleteadmins: false,
      headers: [
        { title: "Email", key: "user_email_id", sortable: false },

        { title: "Delete", key: "action", sortable: false },
      ],
      tableData: [],
      height: 0,
      tableLoading: false,
      adminitems: {},
      approvalType: "",
      formDetails: {},
      formViewDailog: false,
      fixed: true,
      searchF: "",
      actionItem: "",
      selectTeam: "",
      viewAction: "Inititaie",
      userArray: [],
    };
  },
  watch: {
    adminList: {
      async handler() {
        this.selectTeam = "";
        this.$store.commit("Setnamesearch", this.searchF);
        this.height = window.innerHeight - 290;
        await this.adminslist();
        await this.get_all_org_users();
        await this.fetch_details();
      },
      immediate: true,
    },
  },
  // created() {
  //    console.log(this.$store.getters.GetAppDetails.dashboard_id);

  // },
  methods: {
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
      this.selectTeam = "";
      this.$refs.form.resetValidation();
      this.$emit("clicked", 0);
    },
    async add_mutation() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;

        try {
          let result = await API.graphql(
            graphqlOperation(add_and_list_appadmins, {
              input: {
                action_type: "ADD",
                user_email_id: this.selectTeam.user_id,
                app_id: this.rowInfo.admin_dashboard_id,
              },
            })
          );
          this.loading = false;

          var response = JSON.parse(result.data.add_and_list_appadmins);
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
    async adminslist() {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(add_and_list_appadmins, {
            input: {
              action_type: "LIST",
              user_email_id: data.user.user_email_id,
              app_id: this.rowInfo.admin_dashboard_id,
            },
          })
        );
        this.tableLoading = false;

        var response = JSON.parse(result.data.add_and_list_appadmins).data;
        this.tableData = response;
        // console.log(response);
        // console.log(response);
      } catch (error) {
        // console.log(error);
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
    add_action() {
      this.componentCheck = 1;
      this.appAdmins = true;
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
      this.appAdmins = false;
      this.deleteadmins = false;
      this.adminslist();
    },
  },
};
</script>

<style scoped>
.rounded-lg {
  border-radius: 12px !important;
}
.rounded-t-lg {
  border-top-left-radius: 12px !important;
  border-top-right-radius: 12px !important;
}
.cursor-pointer {
  cursor: pointer;
  transition: all 0.2s ease;
}
.cursor-pointer:hover {
  transform: scale(1.05);
}
.dtwidth {
  border-radius: 8px;
  overflow: hidden;
}
.dtwidth :deep(.v-data-table__wrapper) {
  border-radius: 8px;
}
.dtwidth :deep(.v-data-table__tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}
.dtwidth :deep(.v-data-table__tbody tr) {
  transition: background-color 0.2s ease;
}
</style>