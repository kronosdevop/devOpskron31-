<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogTicketTags" max-width="650px" persistent>
      <v-card rounded="lg">
        <!--Card Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5 ml-n2">Add Category</span>
          <v-btn
            icon
            variant="text"
            @click="DialogTicketTagsEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <v-form ref="form">
          <v-row class="pa-3">
            <!--Category-->
            <v-col cols="6" md="6">
              <div class="font-weight-bold ml-1">
                Category<span class="text-error ml-1">*</span>
              </div>
              <v-text-field
                v-model="category"
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
                    'Category must be 20 characters or less',
                ]"
              />
            </v-col>

            <!--Agents-->
            <v-col cols="6" md="6">
              <div class="font-weight-bold ml-1">
                Agents<span class="text-error ml-1">*</span>
              </div>
              <v-autocomplete
                v-model="agents"
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

            <!--Ticket Prefix-->
            <v-col cols="6" md="6">
              <div class="font-weight-bold mt-n8">
                Ticket Prefix <span class="text-error">*</span>
              </div>
              <v-text-field
                v-model="prefix"
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

            <!--Ticket Assignment Mode-->
            <v-col cols="6" md="6">
              <div class="font-weight-bold mt-n8">
                Assignment Method<span class="text-error ml-1">*</span>
              </div>
              <v-select
                v-model="assignment_mode"
                variant="outlined"
                density="compact"
                rounded="lg"
                class="mt-1 ml-n1 pa-1"
                :rules="[(v) => !!v || 'Required']"
                :items="TicketAssignmentModes"
              />
            </v-col>

            <!--Moderator Email-->
            <v-col cols="6" md="6" v-if="assignment_mode === 'MODERATOR'">
              <div class="font-weight-bold mt-n8">
                Moderator Email<span class="text-error ml-1">*</span>
              </div>
              <v-select
                v-model="moderator"
                variant="outlined"
                density="compact"
                rounded="lg"
                class="mt-1 ml-n1 pa-1"
                :rules="[(v) => !!v || 'Required']"
                :items="moderatorList"
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
import { create_list_edit_delete_category } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogTicketTags: Boolean },

  mixins: [get_all_org_users],

  components: { SnackBar },

  data: () => ({
    category: "",
    agents: [],
    prefix: "",
    assignment_mode: "CLAIM_TICKET",
    moderator: "",

    loading: false,

    SnackBarComponent: {},

    TicketAssignmentModes: [
      { title: "Claim", value: "CLAIM_TICKET" },
      { title: "Round Robin", value: "ROUND_ROBIN" },
      { title: "Load Sharing", value: "LOAD_SHARING" },
      { title: "Moderator", value: "MODERATOR" },
    ],
  }),

  watch: {
    DialogTicketTags(val) {
      if (!val) {
        this.$refs.form.reset();
      } else {
        return this.fetchTicketCategoryData();
      }
    },
  },

  computed: {
    userList() {
      return this.orgUsers
        .filter((user) => user.user_status === "ACTIVE")
        .sort((a, b) => a.user_email_id.localeCompare(b.user_email_id))
        .map((user) => ({
          title: user.user_email_id,
          value: user.user_email_id,
        }));
    },
    moderatorList() {
      return this.agents.length
        ? this.userList.filter((user) =>
            this.agents.some((agent) => agent.value === user.value)
          )
        : [];
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
    async fetchTicketCategoryData() {
      await this.get_all_org_users();
    },
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.AddCategory();
      }
    },
    async AddCategory() {
      this.loading = true;
      try {
        const agentEmails = this.agents.map((user) => user.value);
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_category, {
            input: {
              action_type: "CREATE",
              category_name: this.category,
              auto_assign_group: agentEmails,
              prefix_name: this.prefix,
              ticket_distribution: this.assignment_mode,
              moderator_email: this.moderator || null,
            },
          })
        );
        let resultObj = JSON.parse(
          result.data.create_list_edit_delete_category
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
        this.DialogTicketTagsEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to create category, please try again",
        };
      }
      this.loading = false;
    },
    DialogTicketTagsEmit(Toggle) {
      this.$emit("clicked", Toggle);
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
