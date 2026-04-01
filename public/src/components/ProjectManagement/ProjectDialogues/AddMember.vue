<template>
  <div>
    <v-card flat >
      <SnackBar :SnackBarComponent="SnackBarComponent" />

      <!-- <v-toolbar elevation="0" dense>
        <v-autocomplete
          dense
          v-model="teamMembers"
          label="Add Team Members"
          class="mt-5"
          outlined
          :rules="[
            (v) =>
              teamMembers.length > 0 || 'At least one user must be selected',
          ]"
          item-text="full_user_name"
          item-value="user_email_id"
          :items="userArray"
          :search-input.sync="searchF"
          hide-no-data
          style="max-width: 250px"
          multiple
          placeholder="Min 3 Character"
          @input="searchF = ''"
        >
        </v-autocomplete>
        <v-btn
          class="elevation-0 ml-4 mt-n2"
          x-small
          @click="add_users_team()"
          color="primaryColor"
          fab
          dark
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-spacer />
        <v-btn
          class="elevation-0 ml-4 mt-n2"
          x-small
          @click="close_dialog()"
          color="primaryColor"
          fab
          dark
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      
      </v-toolbar> -->

      <v-card-text>
        <v-data-table
          :headers="
            rowInfo.project_status_report?.enabled_member_report
              ? headersrole
              : headers
          "
          :items="tableData"
          :loading="tableLoading"
          :fixed-header="fixed"
          :footer-props="{
            itemsPerPageOptions: [100, 200],
          }"
          :items-per-page="300"
          hide-default-footer
          dense
          :sort-by="['name']"
          class="elevation-1 dtwidth"
        >
          <template v-slot:[`item.contactNumber`]="{ item }">
            <span>{{
              item.contactNumber != "" &&
              item.contactNumber != undefined &&
              item.contactNumber != "N/A"
                ? item.countryCode + " " + item.contactNumber
                : "-"
            }}</span>
          </template>
          <template v-slot:[`item.is_report`]="{ item }">
            <v-icon
              v-if="item.is_report == undefined || item.is_report == true"
              color="green"
              >mdi-check-circle</v-icon
            >
            <v-icon color="red" v-else>mdi-alpha-x-circle</v-icon>
          </template>
          <template v-slot:[`item.role`]="{ item }">
            <span>{{
              item.role != "" && item.role != undefined ? item.role : "-"
            }}</span>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
              @click="edit_member(item)"
              dense
              v-if="
                rowInfo.project_created_by ==
                  $store.getters.GetUserObj.user.user_email_id &&
                rowInfo.project_created_by != item.email
              "
              small
              color="red"
              >mdi-pencil</v-icon
            >
            <v-icon
              @click="delete_member(item)"
              dense
              v-if="
                rowInfo.project_created_by ==
                  $store.getters.GetUserObj.user.user_email_id &&
                rowInfo.project_created_by != item.email
              "
              small
              color="red"
              >mdi-delete</v-icon
            >
            <span v-else>-</span>
          </template>
        </v-data-table>

        <!-- <v-list dense>
          <v-list-item
            v-for="(project, index) in rowInfo.project_visible_members"
            :key="index"
          >
            <v-card class="ma-2" style="width: 600px">
              <v-card-title>
                <v-row dense justify="space-around" align="center">
                  <v-col v-if="fetch_nmae(project, 'url')" cols="auto">
                    <v-avatar size="30">
                      <img :src="fetch_nmae(project, 'url')" alt="NA" />
                    </v-avatar>
                  </v-col>
                  <v-col v-else cols="auto">
                    <v-avatar size="30" class="ma-2">
                      <v-icon>mdi-account</v-icon>
                    </v-avatar>
                  </v-col>

                  <v-col>
                    <div
                      style="
                        font-size: 13px;
                        line-height: 1.2;
                        overflow: hidden;
                        text-overflow: ellipsis;
                      "
                    >
                      {{ fetch_nmae(project, "name") }}
                    </div>
                   
                  </v-col>
                  <v-spacer />
                  <v-icon
                    @click="delete_member(project)"
                    dense
                    small
                    color="red"
                    >mdi-delete</v-icon
                  >
                </v-row>
              </v-card-title>
            </v-card>
          </v-list-item>
        </v-list> -->
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <DeleteMember
        :rowInfo="rowInfo"
        :deleteMemberDialogue="deleteMemberDialogue"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
        :currentData="currentData"
        @clicked="deleteMemberDialogue = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <EditMember
        :rowInfo="rowInfo"
        :editMemberDialogue="editMemberDialogue"
        v-on:successMsg="success_msg"
        v-on:errorMsg="error_msg"
        :currentData="currentData"
        @clicked="editMemberDialogue = false"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import EditMember from "@/components/ProjectManagement/ProjectDialogues/EditMember.vue";
import { edit_project } from "@/graphql/mutations.js";
import DeleteMember from "@/components/ProjectManagement/ProjectDialogues/DeleteMember.vue";
import SnackBar from "@/components/SnackBar.vue";
import { API, graphqlOperation } from "aws-amplify";
import { list_all_user_projects } from "@/graphql/queries.js";

export default {
  // props: {
  //   rowInfo: Object,
  // },

  components: {
    DeleteMember,
    SnackBar,
    EditMember,
  },
  data() {
    return {
      searchF: "",
      teamMembers: [],
      userArray: [],
      componentCheck: 0,
      currentData: {},
      SnackBarComponent: {},
      tableData: [],
      tableLoading: false,
      deleteMemberDialogue: false,
      editMemberDialogue: false,
      fixed: true,
      rowInfo: {},
      headersrole: [
        {
          title: "Name",
          align: "start",
          key: "name",
        },
        {
          title: "Email",
          align: "start",
          key: "email",
        },
        {
          title: "Contact Number",
          align: "start",
          key: "contactNumber",
        },
        {
          title: "Role",
          align: "start",
          key: "role",
        },
        // {
        //   title: "Report",
        //   align: "start",
        //   key: "is_report",
        // },
        {
          title: "Member Type",
          align: "start",
          key: "member_type",
        },
        {
          title: "Actions",
          align: "start",
          key: "actions",
        },
      ],
      headers: [
        {
            title: "Name",
          align: "start",
          key: "name",
        },
        {
          title: "Email",
          align: "start",
          key: "email",
        },
        {
          title: "Contact Number",
          align: "start",
          key: "contactNumber",
        },
        {
          title: "Role",
          align: "start",
          key: "role",
        },
        {
          title: "Member Type",
          align: "start",
          key: "member_type",
        },
        {
          title: "Actions",
          align: "start",
          key: "actions",
        },
      ],
    };
  },
  async mounted() {
    var userList = JSON.parse(localStorage.getItem("allOrgUsers"));
    var Projecctdetails = JSON.parse(localStorage.getItem("projectInfo"));
    this.rowInfo = Projecctdetails;
    await this.fetch_project_list();

    // this.tableData = Projecctdetails.project_visible_members;
    // // console.log(userList);
    this.fetch_users_list(userList);
  },
  methods: {
    edit_member(item) {
      this.componentCheck = 2;
      this.editMemberDialogue = true;
      this.currentData = item;
    },
    async fetch_project_list() {
      this.tableLoading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(list_all_user_projects, {
            input: {
              project_progress: "ALL",
            },
          })
        );
        this.overlay = false;
        this.tableLoading = false;
        this.tableData = [];
        var response = JSON.parse(result.data.list_all_user_projects);

        if (response.Status == "ERROR") {
          this.tableLoading = false;
        } else {
          var Projecctdetails = JSON.parse(localStorage.getItem("projectInfo"));

          response.data.forEach((element) => {
            if (element.project_id == Projecctdetails.project_id) {
              this.rowInfo = element;
              this.tableData = element.project_visible_members;
            }
          });
          this.tableLoading = false;
        }
      } catch (error) {
        this.tableLoading = false;
      }
    },

    success_msg(value) {
      this.deleteMemberDialogue = false;
      this.editMemberDialogue = false;
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.fetch_project_list();
    },

    error_msg(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },

    close_dialog() {
      this.$emit("closeFunc", 0);
    },

    fetch_users_list(value) {
      value.forEach((element) => {
        if (
          element.user_status === "ACTIVE" &&
          !this.rowInfo.project_visible_members.includes(element.user_email_id)
        ) {
          this.userArray.push({
            full_user_name: element.full_user_name,
            user_email_id: element.user_email_id,
          });
        }
      });
    },

    fetch_name(value) {
      var userList = JSON.parse(localStorage.getItem("allOrgUsers"));

      var data = userList.find((element) => element.user_email_id === value);

      // return data.full_user_name;
    },

    // fetch_nmae(value, type) {
    //   var data = null;
    //   var userList = JSON.parse(localStorage.getItem("allOrgUsers"));

    //   data = userList.find((element) => element.user_email_id === value);

    //   if (data) {
    //     if (type == "name") {
    //       return data.full_user_name;
    //     } else if (type == "url") {
    //       if (
    //         data.user_profile_pic_url &&
    //         data.user_profile_pic_url.startsWith("https://")
    //       ) {
    //         return data.user_profile_pic_url;
    //       } else {
    //         return "";
    //       }
    //     }
    //   } else {
    //     return "";
    //   }
    // },

    delete_member(value) {
      this.componentCheck = 1;
      this.deleteMemberDialogue = true;
      this.currentData = value;
    },

    async add_users_team() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(edit_project, {
            input: {
              project_id: this.rowInfo.project_id,
              project_visible_members: this.fetch_users(),
            },
          })
        );

        this.loading = false;
        var response = JSON.parse(result.data.edit_project);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.teamMembers = [];
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },

    fetch_users() {
      var existing = this.rowInfo.project_visible_members;
      var newData = this.teamMembers;
      var final = existing.concat(newData);
      return final;
    },
  },
};
</script>