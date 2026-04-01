<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogAddSubCategory" max-width="650px">
      <v-card rounded="lg">
        <!--Card Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Add Subcategory</span>
          <v-btn
            icon
            variant="text"
            @click="DialogAddSubCategoryEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-form ref="form">
          <v-row class="pa-3">
            <!--Sub Category-->
            <v-col cols="6" md="6">
              <div class="font-weight-bold ml-1">
                Sub-Category <span class="text-error ml-1">*</span>
              </div>
              <v-text-field
                v-model="subcategory"
                rounded="lg"
                variant="outlined"
                density="compact"
                class="mt-1 ml-n1 pa-1"
                maxlength="20"
                :counter="20"
                :rules="[
                  (v) => !!v || 'Required',
                  (v) =>
                    (v && v.length <= 20) ||
                    'Subcategory must be 20 characters or less',
                ]"
              />
            </v-col>

            <v-col cols="6" md="6">
              <div class="font-weight-bold ml-1">
                Agents <span class="text-error ml-1">*</span>
              </div>
              <v-autocomplete
                v-model="subcategory_agents"
                :items="userList"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                rounded="lg"
                class="mt-1 ml-n1 pa-1"
                :rules="[(v) => !!v || 'Required']"
                multiple
                return-object
              >
                <template v-slot:prepend-item>
                  <v-list-item
                    @mousedown.prevent
                    @click="toggleForSelectWatchers"
                  >
                    <v-list-item-action>
                      <v-icon
                        :color="
                          subcategory_agents && subcategory_agents.length > 0
                            ? 'primary'
                            : ''
                        "
                      >
                        {{ iconForSelectWatchers }}
                      </v-icon>
                      <v-list-item-title>Select All</v-list-item-title>
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider class="mt-2"></v-divider>
                </template>

                <template v-slot:selection="{ item, index }">
                  <v-chip density="compact" v-if="index === 0">
                    <span>{{
                      item.title.length < 10
                        ? item.title
                        : `${item.title.slice(0, 10)}..`
                    }}</span>
                  </v-chip>
                  <span
                    v-if="index === 1 && subcategory_agents"
                    class="text-grey text-caption"
                  >
                    (+{{ subcategory_agents.length - 1 }}
                    others)
                  </span>
                </template>
              </v-autocomplete>
            </v-col>

            <v-col cols="6" md="6">
              <div class="font-weight-bold mt-n8">
                Ticket Prefix <span class="text-error ml-1">*</span>
              </div>
              <v-text-field
                v-model="subcategory_prefix"
                variant="outlined"
                density="compact"
                rounded="lg"
                class="mt-1 ml-n1 pa-1"
                maxlength="3"
                :counter="3"
                :rules="[
                  (v) => !!v || 'Required',
                  (v) =>
                    (v && v.length <= 3) ||
                    'Prefix can not be more than 3 letters',
                ]"
              />
            </v-col>
          </v-row>
        </v-form>

        <v-card-actions class="d-flex justify-end mt-n10">
          <v-btn
            rounded="lg"
            color="primary"
            :loading="loading"
            @click="ValidateForm"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { create_list_edit_delete_ticket_type } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogAddSubCategory: Boolean, StoreObj: Object },

  mixins: [get_all_org_users],

  components: { SnackBar },

  data: () => ({
    subcategory: "",
    subcategory_agents: [],
    subcategory_prefix: "",

    loading: false,

    SnackBarComponent: {},
  }),

  watch: {
    DialogAddSubCategory(val) {
      if (!val) {
        this.$refs.form.reset();
      } else {
        return this.fetchSubCategoryData();
      }
    },
  },

  computed: {
    userList() {
      return this.orgUsers
        .filter((user) => user.user_status === "ACTIVE")
        .map((user) => ({
          title: user.user_email_id,
          value: user.user_email_id,
        }));
    },
    iconForSelectWatchers() {
      if (this.selectAllSubCategoryAgents) return "mdi-close-box";
      if (this.selectSomeSubCategoryAgents) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    },
    selectAllSubCategoryAgents() {
      if (this.subcategory_agents) {
        return this.subcategory_agents.length === this.userList.length;
      } else return false;
    },
    selectSomeSubCategoryAgents() {
      if (this.subcategory_agents) {
        return (
          this.subcategory_agents.length > 0 && !this.selectAllSubCategoryAgents
        );
      } else return false;
    },
  },

  methods: {
    DialogAddSubCategoryEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    toggleForSelectWatchers() {
      if (this.selectAllSubCategoryAgents) {
        this.subcategory_agents = [];
      } else {
        this.subcategory_agents = [...this.userList];
      }
    },
    async fetchSubCategoryData() {
      await this.get_all_org_users();
    },
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.AddSubCategory();
      }
    },
    async AddSubCategory() {
      this.loading = true;
      try {
        const subCategoryAgentEmails = this.subcategory_agents.map(
          (user) => user.value
        );
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_ticket_type, {
            input: {
              action_type: "CREATE",
              ticket_type_name: this.subcategory,
              auto_assign_group: subCategoryAgentEmails,
              default_category: this.StoreObj.category_id,
              prefix_name: this.subcategory_prefix,
            },
          })
        );
        let resultObj = JSON.parse(
          result.data.create_list_edit_delete_ticket_type
        );
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "❎ " + resultObj.Message,
          };
        }
        this.loading = false;
        this.DialogAddSubCategoryEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to add ticket type, try again!",
        };
      }
      this.loading = false;
    },
  },
};
</script>
