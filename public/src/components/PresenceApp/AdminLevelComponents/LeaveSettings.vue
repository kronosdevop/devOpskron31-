<template>
  <div>
    <v-card flat >
      <v-row class="mt-3">
        <v-col cols="6">
          <v-card>
            <v-form ref="form">
              <v-row class="pt-5">
                <v-col cols="5">
                  <v-text-field
                    density="compact"
                    variant="outlined"
                    style="max-width: 200px"
                    class="ml-4"
                    label="Leave Name"
                    v-model="corection_data"
                    :rules="[(v) => !!v || 'Required']"
                  />
                </v-col>
                <v-col cols="5">
                  <v-text-field
                    style="max-width: 200px"
                    density="compact"
                    variant="outlined"
                    v-model="noOFDays"
                    class=""
                    :rules="number_rules"
                    :label="'No of Days'"
                  />
                </v-col>

                <v-col cols="2">
                  <v-btn
                    size="x-small"
                    @click="add_action(corection_data)"
                    class="elevation-0 cardCss"
                    fab
                    dark
                  >
                    <v-icon color="white" dark> mdi-plus </v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>

            <v-card-text>
              <v-data-table
                :fixed-header="fixed"
                :headers="headers"
                :items="tableData"
                :loading="tableLoading"
                :items-per-page-options="[10, 20]"
                :items-per-page="20"
                :sort-by="['designation_name']"
                density="compact"
                class="mt-n5 elevation-1 dtwidth"
                :single-select="singleSelect"
                hide-default-footer
              >
                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon
                    v-if="
                      item.duration_name != 'u/o' && item.duration_name != 'c/o'
                    "
                    size="small"
                    @click="delet_leave(item)"
                    color="red"
                    >mdi-delete</v-icon
                  >
                </template>
                <!-- <template v-slot:[`item.showCheckbox`]="{ item }">
                  <span v-if="item.showCheckbox">
                    <v-checkbox
                      class="custom-checkbox-row mt-n3"
                      v-model="item.selected"
                      @change="get_value(item)"
                    ></v-checkbox>
                  </span>
                </template> -->
                <template v-slot:[`item.duration_value`]="{ item }">
                  <span>{{ item.duration_value }} Days</span>
                </template>
              </v-data-table>
            </v-card-text>
            <v-card-actions class="justify-start">
              <v-checkbox
                color="primary"
                class="ml-2"
                v-model="enableCompoff"
                label="Enable Comp-Off"
                @change="fetch_value('comp-off')"
              ></v-checkbox>
              <v-checkbox
                color="primary"
                class="ml-2"
                v-model="enableWeekoff"
                label="Enable Week-Off"
                @change="fetch_value('week-off')"
              ></v-checkbox>
              <v-spacer />
              <v-btn
                depressed
                :loading="loading"
                @click="fetch_org_level_update()"
                dark
                size="small"
                class="cardCss button-corner text-capitalize mt-4 text-white"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="6" lg="6" xl="6">
          <v-card class="pl-2 pr-3 elevation-1 mr-n5 mt-n2">
            <v-card-title> Approvals </v-card-title>
            <v-card-text>
              <LeaveApprovals />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- <v-col cols="6">
          <v-card class="pl-2 pr-3 elevation-1 mr-n5 mt-n2">
            <v-card-text> Approvals </v-card-text>
          </v-card>
        </v-col> -->
      </v-row>
    </v-card>
    <!-- <v-dialog v-model="addDaysWC" persistent max-width="400">
      <v-card>
        <v-toolbar
          v-if="addDaysWC == true"
          elevation="0"
          dark
          dense
          class="navBar"
        >
          <v-toolbar-title class="text--white ml-2">
            <div class="custom-title">
              {{
                "Configure Days for" + " " + checkboxSelectedValue.duration_name
              }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-row no-gutters>
            <v-col cols="12">
              <v-text-field
                outlined
                dense
                v-model="weekCompDays"
                :rules="number_rules"
                label="No of Days"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            @click="save_days()"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog> -->
    <Snackbar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/* eslint-disable */
import { API, graphqlOperation } from "aws-amplify";
import {
  master_leave_settings,
  edit_organization,
} from "@/graphql/mutations.js";
import Snackbar from "@/components/SnackBar.vue";
import LeaveApprovals from "@/components/PresenceApp/AdminLevelComponents/LeaveApprovals.vue";

export default {
  components: {
    Snackbar,
    LeaveApprovals,
  },
  data() {
    return {
      SnackBarComponent: {},
      typeLeave: "Days",
      corection_data: "",
      number_rules: [
        (v) => !!v || "required ",
        (value) => /^\d+$/.test(value) || "Only numbers are allowed",
      ],

      noOFDays: "",
      duartionitem: ["Days", "Months"],
      height: 0,
      tableData: [],
      tableLoading: false,
      loading: false,
      fixed: true,
      headers: [
        {
          title: "Leave Name",
          key: "duration_name",
          sortable: false,
        },
        {
          title: "Days",
          key: "duration_value",
          sortable: false,
        },
        { title: "Action", key: "actions", sortable: false },
      ],
      singleSelect: false,
      selected: [],
      addDaysWC: false,
      checkboxSelectedValue: null,
      weekCompDays: null,
      savedArray: [],
      actualRespone: [],
      enableCompoff: false,
      enableWeekoff: false,
      weekOffCheck: false,
      compOffCheck: false,
    };
  },

  created() {
    this.weekOffCheck = false;
    this.compOffCheck = false;
    this.height = window.innerHeight - 370;

    this.get_leave();
  },

  methods: {
    delet_leave(item) {
      for (let i = 0; i < this.tableData.length; i++) {
        if (item.duration_name == this.tableData[i].duration_name) {
          this.tableData.splice(i, 1);
        }
      }
    },

    save_action() {
      var data = [];
      this.tableData.forEach((element) => {
        data.push({
          duration_name: element.duration_name,
          duration_value: element.duration_value,
          duration_type: "Days",
        });
      });
      const weekOffExists = this.actualRespone.some(
        (item) => item.duration_name === "u/o"
      );
      const compOffExists = this.actualRespone.some(
        (item) => item.duration_name === "c/o"
      );
      if (compOffExists && this.enableCompoff) {
        data.push({
          duration_name: "c/o",
          duration_value: "365",
          duration_type: "Days",
        });
      } else if (!compOffExists && this.enableCompoff) {
        data.push({
          duration_name: "c/o",
          duration_value: "365",
          duration_type: "Days",
        });
      }

      if (weekOffExists && this.enableWeekoff) {
        data.push({
          duration_name: "u/o",
          duration_value: "365",
          duration_type: "Days",
        });
      } else if (!weekOffExists && this.enableWeekoff) {
        data.push({
          duration_name: "u/o",
          duration_value: "365",
          duration_type: "Days",
        });
      }

      this.savedArray = data;
      return data;
    },

    fetch_value(value) {
      if (value == "comp-off") {
        this.compOffCheck = true;
      } else {
        this.weekOffCheck = true;
      }
    },

    get_value(value) {
      if (value.selected == true) {
        this.weekCompDays = null;
        this.checkboxSelectedValue = value;
        this.addDaysWC = true;
      } else {
        for (let i = 0; i < this.tableData.length; i++) {
          if (value.duration_name == this.tableData[i].duration_name) {
            this.tableData[i].selected = false;
          }
        }
      }
    },

    close_dialog() {
      this.addDaysWC = false;
    },

    async add_action(corection_data) {
      const { valid } = await this.$refs.form.validate();

      if (valid) {
        const key_object = {
          duration_name: corection_data,
          duration_value: this.noOFDays,
          duration_type: this.typeLeave,
        };

        const hasMatchingCode = this.tableData.some(
          (obj) => obj.duration_name === corection_data
        );

        if (!hasMatchingCode) {
          this.tableData.push(key_object);
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            Top: true,
            SnackbarText: "Leave already exists",
          };
        }

        this.corection_data = "";
        this.noOFDays = "";
        this.$refs.form.resetValidation();
      } else {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          Top: true,
          SnackbarText: "Please fill the form correctly",
        };
      }
    },

    async get_leave() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(master_leave_settings, {
            input: {
              action_type: "GET",
              organization_id: data.organization.organization_id,
            },
          })
        );
        this.tableData = [];
        this.actualRespone = [];
        var response = JSON.parse(result.data.master_leave_settings);

        if (response.Status == "SUCCESS") {
          this.actualRespone =
            response.data[0].leave_types == undefined
              ? []
              : response.data[0].leave_types;

          this.actualRespone.forEach((element) => {
            if (
              element.duration_name != "u/o" &&
              element.duration_name != "c/o"
            ) {
              this.tableData.push(element);
            }
          });

          const weekOffExists = this.actualRespone.some(
            (item) => item.duration_name === "u/o"
          );
          const compOffExists = this.actualRespone.some(
            (item) => item.duration_name === "c/o"
          );
          if (weekOffExists) {
            this.enableWeekoff = true;
          }
          if (compOffExists) {
            this.enableCompoff = true;
          }
        }
      } catch (err) {
        this.overlay = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          Top: true,
          SnackbarText: err.errors[0].message,
        };
      }
    },

    async fetch_org_level_update() {
      this.savedArray = [];
      await this.save_action();
      const weekOffExists = this.savedArray.some(
        (item) => item.duration_name === "u/o"
      );

      var weekOfObject =
        this.$store.getters.GetOrgDetails.organization.week_off;

      var allFalse = true;

      for (var key in weekOfObject) {
        if (weekOfObject[key] === true) {
          allFalse = false;
          break;
        }
      }

      if (allFalse || weekOffExists == false) {
        this.save_mutation();
      } else {
        this.savedArray.forEach((element) => {
          if (element.duration_name == "u/o") {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              Top: true,
              SnackbarText:
                "Please remove organization week off to enable this settings",
            };
          }
        });
      }
      // console.log(allFalse);
    },

    async save_mutation() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(master_leave_settings, {
            input: {
              action_type: "CREATE",
              organization_id: data.organization.organization_id,
              leave_types: this.save_action(),
            },
          })
        );

        var response = JSON.parse(result.data.master_leave_settings);
        if (response.Status == "SUCCESS") {
          await this.get_leave();

          this.update_org_settisng();
          this.weekOffCheck = false;
          this.compOffCheck = false;
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            Top: true,
            SnackbarText: response.Message,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            Top: true,
            SnackbarText: response.Message,
          };
        }

        this.loading = false;
      } catch (err) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          Top: true,
          SnackbarText: err.errors[0].message,
        };

        this.loading = false;
      }
    },

    async update_org_settisng() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_organization, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              comp_off: this.fetch_comff(),
              week_off_settings: this.fetch_boolen_value(),
            },
          })
        );
        var response = JSON.parse(result.data.edit_organization);
        if (response.Status == "SUCCESS") {
          await this.get_Org_details();
          this.$store.commit("SetOrgDetails", this.orgDetails);
        } else {
        }
      } catch (error) {}
    },

    fetch_comff() {
      var data = null;
      const compOffExists = this.actualRespone.some(
        (item) => item.duration_name === "c/o" && item.duration_value != "0"
      );
      if (!compOffExists) {
        data = false;
      } else {
        data = true;
      }
      return data;
    },

    fetch_boolen_value() {
      var data = null;
      const weekOffExists = this.actualRespone.some(
        (item) => item.duration_name === "u/o" && item.duration_value != "0"
      );

      if (!weekOffExists) {
        data = false;
      } else {
        data = true;
      }

      return data;
    },
  },
};
</script>

<style scoped>
.custom-checkbox-row {
  height: 10px;
}
</style>