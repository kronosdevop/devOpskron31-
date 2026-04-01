<template>
  <div>
    <v-toolbar color="transparent" class="mt-n3">
      <v-toolbar-title>
        <v-icon color="primary" class="mr-2">mdi-database-alert</v-icon>
        Data Correction
      </v-toolbar-title>
    </v-toolbar>
    <v-container class="mt-n4">
      <v-card variant="solo" elevation="0" rounded="lg">
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <v-card class="mt-2 mb-5 mx-1" elevation="3" rounded="lg">
                <v-row>
                  <v-col cols="12" sm="12" xs="12" md="12" lg="12" xl="6">
                    <div class="mt-4 text-black font-weight-bold ml-4">
                      Data Correction Reasons
                    </div>

                    <v-row>
                      <v-col cols="9" sm="9" xs="9" md="9" lg="9" xl="9">
                        <v-form ref="form">
                          <v-text-field
                            label="Enter Data"
                            density="compact"
                            variant="outlined"
                            :rules="rules_datacorrect"
                            v-model="corection_data"
                            class="ml-4 mt-2"
                          ></v-text-field>
                        </v-form>
                      </v-col>

                      <v-col cols="1" sm="1" xs="1" md="1" lg="1" xl="1">
                        <v-btn
                          height="40"
                          color="primary"
                          class="white--text mt-2"
                          @click="add_datacorrection(corection_data)"
                        >
                          <v-icon dark>mdi-plus</v-icon></v-btn
                        >
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12" sm="12" xs="12" md="12" lg="12" xl="12">
                    <v-row
                      no-gutters
                      class="ml-6 text-left"
                      v-for="(item, idx) in dataitem_datacorrection"
                      :key="idx"
                    >
                      <v-col
                        cols="10"
                        sm="7"
                        xs="7"
                        md="7"
                        lg="7"
                        xl="7"
                        class="mt-n10"
                        ><li style="list-style-type: none" class="mt-3">
                          {{ item.name }}
                        </li>
                      </v-col>
                      <v-col cols="2" sm="2" xs="2" md="2" lg="2" xl="2">
                        <v-icon
                          size="small"
                          :disabled="item.index < 2"
                          @click="delete_feature_data_correction(item)"
                          color="red"
                          class="mt-n13 cursor"
                          >mdi-delete</v-icon
                        >
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-card-actions class="justify-center">
                  <v-btn
                    height="40"
                    @click="save_datacorrection()"
                    :loading="loading"
                    class="text-capitalize cardCss ml-2"
                    >Save</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card class="mt-2" elevation="3" rounded="lg">
                <div class="mt-4 ml-4 text-black font-weight-bold">
                  Data Correction Approval
                </div>
                <v-card-text class="">
                  <v-form ref="form1">
                    <v-row no-gutters>
                      <v-col cols="12">
                        <div class="text-left">Approval Required</div></v-col
                      >
                      <v-col cols="12">
                        <v-radio-group
                          class="ml-n2"
                          color="primary"
                          v-model="approvalAction"
                          inline
                        >
                          <v-radio label="Yes" value="yes"></v-radio>
                          <v-radio label="No" value="no"></v-radio>
                        </v-radio-group>
                      </v-col>

                      <v-col v-if="approvalAction == 'yes'" cols="12">
                        <v-autocomplete
                          :rules="
                            approvalAction == 'yes'
                              ? [(v) => !!v || 'required ']
                              : []
                          "
                          label="Select Member"
                          v-model="selectedMember"
                          :items="userList"
                          @input="search = ''"
                          item-text="title"
                          item-value="value"
                          density="compact"
                          variant="outlined"
                          :menu-props="{ offsetY: true, maxHeight: 200 }"
                        ></v-autocomplete>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
                <v-card-actions class="justify-center">
                  <v-btn
                    depressed
                    :loading="loadingapprove"
                    @click="validate_data()"
                    height="40"
                    class="cardCss text-capitalize ml-4"
                  >
                    Save
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
    <Snackbar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { edit_organization } from "@/graphql/mutations.js";
import { get_Org_details } from "@/mixins/GetOrgDetails.js";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { datacorrection_comments_list_edit } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import Snackbar from "@/components/SnackBar.vue";
export default {
  mixins: [get_all_org_users, get_Org_details],
  components: {
    Snackbar,
  },
  data: () => ({
    SnackBarComponent: {},
    loading: false,
    loadingapprove: false,
    datacorrection_id: "",
    selectedMember: "",
    userList: [],
    search: "",
    approvalAction: "yes",
    rules_datacorrect: [
      (v) => v.length != 0 || "DataCorrection Reason cannot be empty",
      (v) =>
        /^[a-z\sA-Z]{1,30}$/.test(v) ||
        "DataCorrection Reason cannot contain special characters ",
    ],
    corection_data: [],
    approvalData: [],
    dataObj: {},
    dataitem_datacorrection: [],
  }),
  async created() {
    await this.get_list();
    await this.get_all_org_users();
    await this.get_Org_details();
    this.fetch_users();
  },
  methods: {
    fecth_updated_list() {
      this.approvalData.forEach((element) => {
        if (element.name == this.dataObj.name) {
          if (
            this.approvalAction == "yes" &&
            element.approvers_list.length != 0
          ) {
            element.approvers_list[0].user_email_id = this.selectedMember;
            element.is_approval = true;
          } else if (
            this.approvalAction == "yes" &&
            element.approvers_list.length == 0
          ) {
            element.approvers_list = [
              { step_no: 1, user_email_id: this.selectedMember },
            ];
            element.is_approval = true;
          } else {
            element.approvers_list = [];
            element.is_approval = false;
          }
        }
      });
      return JSON.stringify(this.approvalData);
    },
    async validate_data() {
      if (this.$refs.form1.validate()) {
        this.approval_actions();
      }
    },
    async approval_actions() {
      this.loadingapprove = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_organization, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              member_management_settings: await this.fecth_updated_list(),
            },
          })
        );
        var response = JSON.parse(result.data.edit_organization);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "Updated Successfully",
            timeout: 5000,
            Top: true,
          };

          this.loadingapprove = false;
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };

          this.loadingapprove = false;
        }
      } catch (error) {
        this.loadingapprove = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    fetch_users() {
      this.userList = [];
      this.approvalData = [];
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE" && element.user_type != "CHATBOT") {
          this.userList.push({
            title: element.full_user_name,
            value: element.user_email_id,
          });
        }
      });
      this.userList.sort((a, b) => a.title.localeCompare(b.title));
      this.approvalData =
        this.orgDetails.organization.member_management_settings;

      let approvals;
      approvals = this.orgDetails.organization.member_management_settings;
      this.dataObj = approvals.find((item) => item.name === "DATA_CORRECTION");

      this.approvalAction = this.dataObj.is_approval == true ? "yes" : "no";
      if (this.dataObj.is_approval == true) {
        this.selectedMember = this.dataObj.approvers_list[0].user_email_id;
      } else {
        this.selectedMember = "";
      }
    },
    async save_datacorrection() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(datacorrection_comments_list_edit, {
            input: {
              organization_id: data.organization.organization_id,
              datacorrection_comments: this.dataitem_datacorrection.map(
                (val) => {
                  return val.name;
                }
              ),
              datacorrection_id: this.datacorrection_id,
              action_type: "EDIT",
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(
          result.data.datacorrection_comments_list_edit
        );
        // console.log(response);
        this.loading = false;

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
    },
    async get_list() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(datacorrection_comments_list_edit, {
            input: {
              organization_id: data.organization.organization_id,
              datacorrection_comments: this.dataitem_datacorrection.map(
                (val) => {
                  return val.name;
                }
              ),

              action_type: "LIST",
            },
          })
        );

        var response = JSON.parse(
          result.data.datacorrection_comments_list_edit
        );

        this.dataitem_datacorrection =
          response.data.datacorrection_comments.map((val, i) => {
            return {
              name: val,
              index: i,
            };
          });
        this.datacorrection_id = response.data.datacorrection_id;
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
    async add_datacorrection(corection_data) {
      const formValidation = await this.$refs.form.validate();

      if (formValidation.valid) {
        const trimmedData = (corection_data || "").toString().trim();

        if (!trimmedData) {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            Top: true,
            SnackbarText: "Please enter a valid Data Correction Reason",
          };
          return;
        }

        const hasMatchingCode = this.dataitem_datacorrection.some(
          (obj) => obj.name.toLowerCase() === trimmedData.toLowerCase()
        );

        if (!hasMatchingCode) {
          this.dataitem_datacorrection.push({ name: trimmedData });

          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            Top: true,
            SnackbarText: "Data Correction Reason added successfully",
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            Top: true,
            SnackbarText: "Data Correction Reason already exists",
          };
        }

        this.corection_data = "";
        this.$refs.form.resetValidation();
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          Top: true,
          SnackbarText: "Please fill the required field.",
        };
      }
    },
    delete_feature_data_correction(item) {
      for (let i = 0; i < this.dataitem_datacorrection.length; i++) {
        if (item.name == this.dataitem_datacorrection[i].name) {
          this.dataitem_datacorrection.splice(i, 1);
        }
      }
    },
  },
};
</script>

<style></style>
