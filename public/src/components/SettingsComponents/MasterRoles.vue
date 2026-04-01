<template>
  <div>
    <v-toolbar flat dense>
      <v-radio-group v-model="roleActions" row>
        <v-radio label="Role Creation" value="roleCreation"></v-radio>
        <v-radio label="Role Mapping" value="roleMapping"></v-radio>
      </v-radio-group>
      <v-spacer />
      <v-btn
        v-if="roleActions == 'roleCreation'"
        small
        @click="add_action()"
        class="mt-n2 elevation-0 cardCss"
        fab
        dark
      >
        <v-icon dark> mdi-plus </v-icon>
      </v-btn>
      <v-btn
        v-if="roleActions == 'roleMapping'"
        small
        @click="mapping_roles()"
        class="mt-n2 elevation-0 cardCss"
        fab
        dark
      >
        <v-icon dark> mdi-plus </v-icon>
      </v-btn>
    </v-toolbar>
    <v-card v-if="roleActions == 'roleCreation'" flat>
      <v-card-text>
        <v-data-table
          :height="height"
          :fixed-header="fixed"
          :headers="headers"
          :items="tableData"
          :loading="tableLoading"
          :items-per-page="10"
          dense
          class="mt-n5 elevation-1 dtwidth"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small color="red" @click="delete_user_items(item)"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="roleActions == 'roleMapping'">
      <MappingRoles />
    </div>
    <div v-if="componentCheck == 1">
      <AddRoles
        :addingRolesDialog="addingRolesDialog"
        @clicked="addingRolesDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <MappingUserRole
        :mappingRolesDialog="mappingRolesDialog"
        @clicked="mappingRolesDialog = false"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import AddRoles from "@/components/SettingsDialogs/AddRoles.vue";
import MappingRoles from "@/components/SettingsComponents/MappingRoles.vue";
import MappingUserRole from "@/components/SettingsDialogs/MappingUserRole.vue";

export default {
  components: {
    AddRoles,
    MappingRoles,
    MappingUserRole,
  },
  data() {
    return {
      componentCheck: 0,
      addingRolesDialog: false,
      height: 0,
      headers: [
        {
          text: "Role",
          value: "designation_name",
          sortable: false,
        },
        {
          text: "Action",
          value: "group_name",
          sortable: false,
        },
      ],
      tableData: [],
      fixed: false,
      tableLoading: false,
      roleActions: "roleCreation",
      mappingRolesDialog: false,
    };
  },
  created() {
    this.height = window.innerHeight - 310;
  },
  methods: {
    add_action() {
      this.componentCheck = 1;
      this.addingRolesDialog = true;
    },

    mapping_roles() {
      this.componentCheck = 2;
      this.mappingRolesDialog = true;
    },
  },
};
</script>