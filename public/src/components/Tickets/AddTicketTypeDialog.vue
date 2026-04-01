<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogAddTicketType" max-width="700px" persistent>
      <v-card rounded="xl">
        <!--Card Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5"
            >Add Ticket Type/Category/Tags</span
          >
          <v-btn
            icon
            variant="text"
            @click="DialogAddTicketTypeEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <div class="d-flex justify-center">
          <v-form ref="form" class="pa-5">
            <v-row no-gutters class="pa-2">
              <!--Category-->
              <v-col cols="5" md="5">
                <div class="font-weight-bold mt-n3">Category</div>
                <v-text-field
                  v-model="ticket_category"
                  variant="outlined"
                  density="compact"
                  rounded="xl"
                  class="mt-1 pa-1"
                  width="250"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>

              <!--Category Agents-->
              <v-col cols="5" md="5">
                <div class="font-weight-bold mt-n3">Agents</div>
                <v-autocomplete
                  v-model="ticket_category_agents"
                  :items="userList"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  rounded="xl"
                  class="mt-1 pa-1"
                  width="250"
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
                          :color="agents && agents.length > 0 ? 'primary' : ''"
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
                      v-if="index === 1 && agents"
                      class="text-grey text-caption"
                    >
                      (+{{ agents.length - 1 }}
                      others)
                    </span>
                  </template>
                </v-autocomplete>
              </v-col>

              <!--Create Category Button-->
              <v-col cols="2" md="2">
                <v-tooltip text="Add">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon color="primary" flat size="30" class="mt-5"> 
                      <v-icon color="white">mdi-plus</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-col>

              <!--Category Display Card-->
              <v-col cols="12" md="12">
                <v-card
                  v-model="ticket_category_display"
                  variant="outlined"
                  density="compact"
                  rounded="xl"
                  class="pa-1"
                  height="150"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>

              <v-divider class="mt-3"></v-divider>

              <!--Sub Category-->
              <v-col cols="6" md="6">
                <div class="font-weight-bold mt-2">Sub Category</div>
                <v-select
                  v-model="ticket_subcategory"
                  variant="outlined"
                  density="compact"
                  rounded="xl"
                  class="mt-1 pa-1"
                  width="300"
                  :items="updatedCategoriesList"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>

              <!--Sub Category Agents-->
              <v-col cols="6" md="6">
                <div class="font-weight-bold mt-2">Agents</div>
                <v-autocomplete
                  v-model="ticket_subcategory_agents"
                  :items="userList"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  rounded="xl"
                  class="mt-1 pa-1"
                  width="300"
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
                          :color="agents && agents.length > 0 ? 'primary' : ''"
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
                      v-if="index === 1 && agents"
                      class="text-grey text-caption"
                    >
                      (+{{ agents.length - 1 }}
                      others)
                    </span>
                  </template>
                </v-autocomplete>
              </v-col>

              <!--Subcategory Display Card-->
              <v-col cols="12" md="12">
                <v-card
                  v-model="ticket_subcategory_display"
                  variant="outlined"
                  density="compact"
                  rounded="xl"
                  class="pa-1"
                  height="150"
                  :rules="[(v) => !!v || 'Required']"
                />
              </v-col>

              <v-divider class="mt-3"></v-divider>

              <!--Ticket Prefix-->
              <v-col cols="6" md="6">
                <div class="font-weight-bold mt-3">Ticket Prefix</div>
                <v-text-field
                  v-model="ticket_prefix"
                  label="Ticket Prefix"
                  variant="outlined"
                  density="compact"
                  rounded="xl"
                  class="mt-1 pa-1"
                  width="300"
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
        </div>

        <v-card-actions class="mt-n10">
          <v-btn
            rounded="lg"
            class="text-white mr-4"
            variant="flat"
            color="primary"
            :loading="loading"
            @click="ValidateForm"
          >
            <v-icon color="white">mdi-plus</v-icon>
            Add
            <template #loader>
              <v-progress-circular indeterminate color="white" />
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { GetAllListCategories } from "@/mixins/GetAllListCategories";
import { GetAllListPriorities } from "@/mixins/GetAllListPriorities";
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { create_list_edit_delete_ticket_type } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogAddTicketType: Boolean },

  mixins: [GetAllListCategories, GetAllListPriorities, get_all_org_users],

  components: { SnackBar },

  data: () => ({
    ticket_category: "",
    ticket_category_agents: [],
    ticket_category_display: "",

    ticket_subcategory: "",
    ticket_subcategory_agents: [],
    ticket_subcategory_display: "",

    ticket_prefix: "",

    loading: false,

    SnackBarComponent: {},
  }),

  watch: {
    async DialogAddTicketType(val) {
      if (val) {
        await this.fetchTicketTypeData();
      } else {
        this.$refs.form.reset();
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
    updatedCategoriesList() {
      return this.ListAllCategories.map((category) => ({
        title: category.category_name,
        value: category.category_id,
      }));
    },
    updatedPriorities() {
      return this.ListAllPriorities.map((priority) => ({
        title: priority.priority_name,
        value: priority.priority_id,
      }));
    },
    iconForSelectWatchers() {
      if (this.selectAllAgents) return "mdi-close-box";
      if (this.selectSomeAgents) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    },
    selectAllAgents() {
      if (this.agents) {
        return this.agents.length === this.userList.length;
      } else return false;
    },
    selectSomeAgents() {
      if (this.agents) {
        return this.agents.length > 0 && !this.selectAllAgents;
      } else return false;
    },
  },

  methods: {
    DialogAddTicketTypeEmit(toggle) {
      this.$emit("clicked", toggle);
    },
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.AddTicketType();
      }
    },
    async AddTicketType() {
      this.loading = true;
      try {
        const agentEmails = this.agents.map((user) => user.value);
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_ticket_type, {
            input: {
              action_type: "CREATE",
              ticket_type_name: this.ticket_type,
              auto_assign_group: agentEmails,
              default_category: this.category,
              prefix_name: this.ticket_prefix,
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
            SnackbarText: resultObj.Message,
          };
          this.DialogAddTicketTypeEmit(2);
          return;
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Failed to add ticket type, try again!",
        };
      } finally {
        this.loading = false;
      }
    },
    async fetchTicketTypeData() {
      await this.GetAllListCategoriesMethod();
      await this.get_all_org_users();
    },
    toggleForSelectWatchers() {
      if (this.selectAllAgents) {
        this.agents = [];
      } else {
        this.agents = [...this.userList];
      }
    },
  },
};
</script>
