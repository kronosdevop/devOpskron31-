<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogEditTicketTags" max-width="650px">
      <v-card rounded="lg">
        <!--Card Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5"
            >Editing Category - {{ StoreObj.category_name }}</span
          >
          <v-btn
            icon
            variant="text"
            @click="DialogEditTicketTagsEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-row class="pa-3">
          <!--Category-->
          <v-col cols="6" md="6">
            <div class="font-weight-bold ml-1">
              Category<span class="text-error ml-1">*</span>
            </div>
            <v-text-field
              v-model="edit_category"
              rounded="lg"
              variant="outlined"
              density="compact"
              class="mt-1 ml-n1 pa-1"
              maxlength="20"
              :counter="20"
              :rules="[
                (v) => !!v || 'Required',
                (v && v.length <= 20) ||
                  'Category must be 20 characters or less',
              ]"
            />
          </v-col>

          <!--Agents-->
          <v-col cols="6" md="6">
            <div class="font-weight-bold ml-1">
              Agents <span class="text-error ml-1">*</span>
            </div>
            <v-autocomplete
              v-model="edit_agents"
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
                        edit_agents && edit_agents.length > 0 ? 'primary' : ''
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
                    <v-chip v-bind="props" density="compact" v-if="index === 0">
                      <span>{{
                        item.title.length < 10
                          ? item.title
                          : `${item.title.slice(0, 10)}..`
                      }}</span>
                    </v-chip>
                  </template>

                  <div>
                    <div v-for="(agent, index) in edit_agents" :key="index">
                      {{ agent.title }}
                    </div>
                  </div>
                </v-tooltip>

                <span
                  v-if="index === 1 && edit_agents"
                  class="text-grey text-caption"
                >
                  (+{{ edit_agents.length - 1 }}
                  others)
                </span>
              </template>
            </v-autocomplete>
          </v-col>

          <!--Ticket Prefix-->
          <v-col cols="6" md="6">
            <div class="font-weight-bold mt-n6 ml-1">
              Ticket Prefix <span class="text-error ml-1">*</span>
            </div>
            <v-text-field
              v-model="edit_prefix"
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
            <div class="font-weight-bold mt-n6">
              Assignment Method<span class="text-error ml-1">*</span>
            </div>
            <v-select
              v-model="edited_assignment_mode"
              variant="outlined"
              density="compact"
              rounded="lg"
              class="mt-1 ml-n1 pa-1"
              :rules="[(v) => !!v || 'Required']"
              :items="TicketAssignmentModes"
            />
          </v-col>

          <!--Moderator Email-->
          <v-col cols="6" md="6" v-if="edited_assignment_mode === 'MODERATOR'">
            <div class="font-weight-bold mt-n8">
              Moderator Email<span class="text-error ml-1">*</span>
            </div>
            <v-select
              v-model="edited_moderator"
              variant="outlined"
              density="compact"
              rounded="lg"
              class="mt-1 ml-n1 pa-1"
              :rules="[(v) => !!v || 'Required']"
              :items="moderatorList"
            />
          </v-col>
        </v-row>

        <v-card-actions class="d-flex justify-end mt-n10">
          <v-btn
            rounded="lg"
            color="primary"
            :loading="loading"
            @click="EditCategory"
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
import { create_list_edit_delete_category } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogEditTicketTags: Boolean, StoreObj: Object },

  mixins: [get_all_org_users],

  components: { SnackBar },

  data: () => ({
    edit_category: "",
    edit_agents: [],
    edit_prefix: "",
    edited_assignment_mode: "",
    edited_moderator: "",

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
    DialogEditTicketTags(val) {
      if (val) {
        this.edit_category = this.StoreObj.category_name;
        this.edit_agents = (this.StoreObj.auto_assign_group || []).map(
          (email) => ({
            title: email,
            value: email,
          })
        );
        this.edit_prefix = this.StoreObj.prefix_name;
        this.edited_assignment_mode = this.StoreObj.ticket_distribution;
        this.edited_moderator = this.StoreObj.moderator_email;
        return this.fetchEditedCategoryData();
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
    moderatorList() {
      return this.edit_agents.length
        ? this.userList.filter((user) =>
            this.edit_agents.some((agent) => agent.value === user.value)
          )
        : [];
    },
    iconForSelectWatchers() {
      if (this.selectAllEditedAgents) return "mdi-close-box";
      if (this.selectSomeEditedAgents) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    },
    selectAllEditedAgents() {
      if (this.edit_agents) {
        return this.edit_agents.length === this.userList.length;
      } else return false;
    },
    selectSomeEditedAgents() {
      if (this.edit_agents) {
        return this.edit_agents.length > 0 && !this.selectAllEditedAgents;
      } else return false;
    },
  },

  methods: {
    async fetchEditedCategoryData() {
      await this.get_all_org_users();
    },
    async EditCategory() {
      this.loading = true;
      try {
        const editAgentEmails = this.edit_agents.map((user) => user.value);
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_category, {
            input: {
              action_type: "UPDATE",
              category_name: this.edit_category,
              auto_assign_group: editAgentEmails,
              prefix_name: this.edit_prefix,
              category_id: this.StoreObj.category_id,
              ticket_distribution: this.edited_assignment_mode,
              moderator_email: this.edited_moderator || null,
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
        this.DialogEditTicketTagsEmit(2);
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to update category, try again.",
        };
      }
      this.loading = false;
    },
    DialogEditTicketTagsEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    toggleForSelectWatchers() {
      if (this.selectAllEditedAgents) {
        this.edit_agents = [];
      } else {
        this.edit_agents = [...this.userList];
      }
    },
  },
};
</script>
