<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogEditSubCategory" max-width="650px">
      <v-card rounded="lg">
        <!--Card Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5"
            >Editing Subcategory - {{ StoreObj.ticket_type_name }}</span
          >
          <v-btn
            icon
            variant="text"
            @click="DialogEditSubCategoryEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <!--Form Fields-->
        <v-form ref="form">
          <v-row class="pa-3">
            <!--Sub Category-->
            <v-col cols="6" md="6">
              <div class="font-weight-bold ml-1">
                Subcategory <span class="text-error ml-1">*</span>
              </div>
              <v-text-field
                v-model="edit_subcategory"
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

            <!--Agents-->
            <v-col cols="6" md="6">
              <div class="font-weight-bold">
                Agents <span class="text-error ml-1">*</span>
              </div>
              <v-autocomplete
                v-model="edit_subcategory_agents"
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
                          edit_subcategory_agents &&
                          edit_subcategory_agents.length > 0
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
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-chip
                        v-bind="props"
                        density="compact"
                        v-if="index === 0"
                      >
                        <span>{{
                          item.title.length < 10
                            ? item.title
                            : `${item.title.slice(0, 10)}..`
                        }}</span>
                      </v-chip>
                    </template>
                    <div>
                      <div
                        v-for="(agent, index) in edit_subcategory_agents"
                        :key="index"
                      >
                        {{ agent.title }}
                      </div>
                    </div>
                  </v-tooltip>

                  <span
                    v-if="index === 1 && edit_subcategory_agents"
                    class="text-grey text-caption"
                  >
                    (+{{ edit_subcategory_agents.length - 1 }}
                    others)
                  </span>
                </template>
              </v-autocomplete>
            </v-col>

            <!--Prefix-->
            <v-col cols="6" md="6">
              <div class="font-weight-bold mt-n8">
                Ticket Prefix <span class="text-error ml-1">*</span>
              </div>
              <v-text-field
                v-model="edit_subcategory_prefix"
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
            color="primary"
            rounded="lg"
            :loading="loading"
            @click="ValidateForm"
          >
            Update
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
  props: { DialogEditSubCategory: Boolean, StoreObj: Object },

  mixins: [get_all_org_users],

  components: { SnackBar },

  data: () => ({
    edit_subcategory: "",
    edit_subcategory_agents: [],
    edit_subcategory_prefix: "",

    loading: false,

    SnackBarComponent: {},
  }),

  watch: {
    DialogEditSubCategory(val) {
      if (val) {
        this.edit_subcategory = this.StoreObj.ticket_type_name;
        this.edit_subcategory_agents = (
          this.StoreObj.auto_assign_group || []
        ).map((email) => ({
          title: email,
          value: email,
        }));
        this.edit_subcategory_prefix = this.StoreObj.prefix_name;
        return this.fetchSubcategoryData();
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
      if (this.selectAllAgents) return "mdi-close-box";
      if (this.selectSomeAgents) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    },
    selectAllAgents() {
      if (this.edit_subcategory_agents) {
        return this.edit_subcategory_agents.length === this.userList.length;
      } else return false;
    },
    selectSomeAgents() {
      if (this.edit_subcategory_agents) {
        return this.edit_subcategory_agents.length > 0 && !this.selectAllAgents;
      } else return false;
    },
  },

  methods: {
    DialogEditSubCategoryEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    async fetchSubcategoryData() {
      await this.get_all_org_users();
    },
    toggleForSelectWatchers() {
      if (this.selectAllAgents) {
        this.edit_subcategory_agents = [];
      } else {
        this.edit_subcategory_agents = [...this.userList];
      }
    },
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.EditSubcategory();
      }
    },
    async EditSubcategory() {
      this.loading = true;
      try {
        const editSubcategoryEmails = this.edit_subcategory_agents.map(
          (user) => user.value
        );
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_ticket_type, {
            input: {
              action_type: "UPDATE",
              ticket_type_name: this.edit_subcategory,
              auto_assign_group: editSubcategoryEmails,
              prefix_name: this.edit_subcategory_prefix,
              default_category: this.StoreObj.default_category,
              ticket_type_id: this.StoreObj.ticket_type_id,
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
        this.DialogEditSubCategoryEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to update subcategory, try again.",
        };
      }
      this.loading = false;
    },
  },
};
</script>
